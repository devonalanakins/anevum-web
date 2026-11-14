#!/usr/bin/env python3
"""ANEVUM.WEB.TEST.2026-11-14.016.CINEMATIC-MASTER-QA

Offline audit of the five-scene owner-review bundle. This is NOT a production
asset acceptance process: media licensing, 4K source fidelity, Safari playback,
and owner moving-image approval still require independent evidence.

No network requests, publishing, asset rewriting, or production configuration.
"""
from __future__ import annotations

import argparse
import hashlib
from html.parser import HTMLParser
import io
import json
from pathlib import Path
import re
import statistics
import subprocess
import shutil
from tempfile import mkdtemp

STATUS = 'REVIEW_ONLY_NOT_PRODUCTION_APPROVED'
SCENES = ('hero', 'experiments', 'research', 'experiences', 'archive')
VARIANTS = ('mp4', 'webm')
SAFE_PATH = re.compile(r'^(?:assets/[a-f0-9]{24}\.webp|media/[a-f0-9]{24}\.(?:mp4|webm))$')
FRAME_W, FRAME_H = 128, 72


def require(ok: bool, why: str) -> None:
    if not ok:
        raise ValueError(why)


def digest(blob: bytes) -> str:
    return hashlib.sha256(blob).hexdigest()


class SceneParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.scenes = {}

    def handle_starttag(self, tag, attrs):
        if tag not in ('a', 'div'):
            return
        attrs = dict(attrs)
        scene = attrs.get('data-scene')
        if not scene:
            return
        require(scene in SCENES and scene not in self.scenes, 'Duplicate or unknown scene')
        self.scenes[scene] = attrs


def validate_bundle(root: Path) -> dict:
    root = root.resolve(strict=True)
    manifest = json.loads((root / 'manifest.json').read_text(encoding='utf8'))
    require(manifest.get('status') == STATUS and
            manifest.get('published') is False and
            manifest.get('rights_verified') is False and
            manifest.get('owner_accepted') is False,
            'Review-only provenance/approval gate failed')
    rows = manifest.get('files')
    require(isinstance(rows, list) and len(rows) == 18, 'Expected exactly 18 media entries')
    inventory = {}
    images = 0
    for entry in rows:
        require(isinstance(entry, dict), 'Invalid media manifest row')
        rel = entry.get('path')
        require(isinstance(rel, str) and SAFE_PATH.fullmatch(rel) and rel not in inventory,
                'Unsafe or duplicated media manifest path')
        expected_hash = entry.get('sha256')
        require(isinstance(expected_hash, str) and re.fullmatch('[0-9a-f]{64}', expected_hash),
                'Invalid media digest')
        require(rel.split('/')[-1].startswith(expected_hash[:24]) and
                isinstance(entry.get('bytes'), int) and entry['bytes'] > 16,
                'Invalid media size or content address')
        path = (root / rel).resolve(strict=True)
        require(path.is_relative_to(root) and path.is_file(), 'Media must stay within bundle')
        blob = path.read_bytes()
        require(len(blob) == entry['bytes'] and digest(blob) == expected_hash,
                'Media checksum mismatch: ' + rel)
        if rel.endswith('.webp'):
            require(blob[:4] == b'RIFF' and blob[8:12] == b'WEBP', 'Invalid WebP signature')
            images += 1
        elif rel.endswith('.mp4'):
            require(blob[4:8] == b'ftyp', 'Invalid MP4 signature')
        else:
            require(blob[:4] == bytes([0x1a, 0x45, 0xdf, 0xa3]), 'Invalid WebM signature')
        inventory[rel] = {**entry, 'absolute_path': path}
    require(images == 6 and len(inventory) - images == 12, 'Unexpected poster/film inventory')

    html = (root / 'index.html').read_text(encoding='utf8')
    require('base64,' not in html and len(html.encode('utf8')) < 180000,
            'Embedded or oversize review HTML')
    parser = SceneParser()
    parser.feed(html)
    require(set(parser.scenes) == set(SCENES), 'Not all five environments are present')
    found = set()
    sources = {}
    for scene in SCENES:
        attrs = parser.scenes[scene]
        require(attrs.get('data-video-ready') == 'true', 'A review scene is not enabled')
        variants = {'mp4': 'data-video-mp4', 'webm': 'data-video-webm'}
        if scene == 'hero':
            variants.update({'mobileMp4': 'data-mobile-mp4',
                             'mobileWebm': 'data-mobile-webm'})
        paths = {}
        for variant, attr in variants.items():
            value = attrs.get(attr)
            require(isinstance(value, str) and value.startswith('./media/'),
                    'Review film must have a relative media URL')
            rel = value[2:]
            expected = 'webm' if variant.lower().endswith('webm') else 'mp4'
            require(rel in inventory and rel.endswith('.' + expected) and rel not in found,
                    'Unregistered or duplicated scene codec')
            found.add(rel)
            paths[variant] = inventory[rel]['absolute_path']
        sources[scene] = paths
    require(len(found) == 12, 'Not all media tracks are assigned to scenes')
    return {'manifest': manifest, 'scenes': sources, 'inventory': inventory}


def probe(path: Path, expected_codec: str) -> dict:
    run = subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format',
                          '-of', 'json', str(path)], capture_output=True,
                         text=True, timeout=30, check=True)
    data = json.loads(run.stdout)
    streams = data.get('streams', [])
    videos = [s for s in streams if s.get('codec_type') == 'video']
    require(len(videos) == 1 and len(streams) == 1, 'Expected one silent video stream')
    s = videos[0]
    require(s.get('codec_name') == expected_codec, 'Unexpected video codec')
    width, height = int(s['width']), int(s['height'])
    require(width >= 320 and height >= 240 and not (width % 2 or height % 2),
            'Unexpected video dimensions')
    require(s.get('r_frame_rate') == '24/1', 'Video is not 24 fps')
    frames = int(s.get('nb_frames') or round(float(data['format']['duration']) * 24))
    duration = float(data['format']['duration'])
    require(4 <= duration <= 12 and abs(frames - 24 * duration) <= 1,
            'Unexpected frame count or duration')
    return {'width': width, 'height': height, 'frames': frames, 'fps': 24,
            'duration_s': round(duration, 3), 'codec': s['codec_name'],
            'bytes': path.stat().st_size, 'sha256': digest(path.read_bytes())}


def frame_mad(first: bytes, second: bytes) -> float:
    require(len(first) == len(second) and len(first) > 0, 'Invalid decoded frame samples')
    return sum(abs(a - b) for a, b in zip(first, second)) / len(first)


def decoded_luma_frames(path: Path, expected_count: int) -> list[bytes]:
    result = subprocess.run(['ffmpeg', '-hide_banner', '-v', 'error', '-i', str(path),
                             '-an', '-vf', f'scale={FRAME_W}:{FRAME_H},format=gray',
                             '-f', 'rawvideo', '-pix_fmt', 'gray', 'pipe:1'],
                            capture_output=True, timeout=90, check=True)
    stride = FRAME_W * FRAME_H
    require(len(result.stdout) % stride == 0, 'Misaligned decoded grayscale frames')
    count = len(result.stdout) // stride
    require(count == expected_count and 0 < count <= 360, 'Decoder frame count mismatch')
    return [result.stdout[i * stride:(i + 1) * stride] for i in range(count)]


def motion_stats(frames: list[bytes]) -> dict:
    require(len(frames) >= 4, 'Insufficient decoded film frames')
    adjacency = [frame_mad(a, b) for a, b in zip(frames, frames[1:])]
    ordinary = statistics.median(adjacency)
    seam = frame_mad(frames[-1], frames[0])
    quarter = frame_mad(frames[0], frames[len(frames) // 4])
    return {'adjacent_median_mad': round(ordinary, 4),
            'seam_mad': round(seam, 4),
            'seam_to_adjacency_ratio': round(seam / max(.10, ordinary), 2),
            'quarter_cycle_mad': round(quarter, 4),
            'near_still_frame_fraction': round(sum(x <= .10 for x in adjacency) / len(adjacency), 3)}


def render_contact_sheet(scenes: dict, output: Path) -> None:
    from PIL import Image, ImageDraw, ImageOps
    slots = [('hero (desktop)', scenes['hero']['mp4']),
             ('hero (mobile)', scenes['hero']['mobileMp4'])] + [
                 (name, scenes[name]['mp4']) for name in SCENES[1:]]
    cell_w, cell_h, label_h = 290, 174, 29
    margin, header = 16, 72
    canvas = Image.new('RGB', (margin * 2 + 4 * cell_w,
                                header + len(slots) * (cell_h + label_h) + margin), '#11151b')
    draw = ImageDraw.Draw(canvas)
    draw.text((margin, 14), 'ANEVUM / FIVE-SCENE MOTION REVIEW', fill='#e6d3ba')
    draw.text((margin, 36), '0% / 25% / 50% / 75% | REVIEW ONLY, NOT A FINAL MASTER', fill='#b4b2b0')
    for row, (label, file) in enumerate(slots):
        metadata = probe(file, 'h264')
        for col, fraction in enumerate((0, .25, .50, .75)):
            result = subprocess.run([
                'ffmpeg', '-hide_banner', '-v', 'error', '-ss',
                f'{metadata["duration_s"] * fraction:.4f}', '-i', str(file),
                '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', 'pipe:1'],
                capture_output=True, timeout=40, check=True)
            image = Image.open(io.BytesIO(result.stdout)).convert('RGB')
            image = ImageOps.contain(image, (cell_w - 6, cell_h - 6), Image.Resampling.LANCZOS)
            x, y = margin + col * cell_w, header + row * (cell_h + label_h)
            draw.rectangle((x, y, x + cell_w - 1, y + cell_h - 1), fill='#050709')
            canvas.paste(image, (x + (cell_w - image.width) // 2,
                                 y + (cell_h - image.height) // 2))
            draw.text((x + 5, y + cell_h + 5), label + (' / ' + str(int(fraction * 100)) + '%' if col else ''),
                      fill='#d5dbe0')
    canvas.save(output)


def audit(root: Path, output: Path, *, sheet: bool = True) -> dict:
    require(not output.exists(), 'Refusing to overwrite an existing QC report')
    bundle = validate_bundle(root)
    records = []
    for scene in SCENES:
        files = bundle['scenes'][scene]
        variants = ('mp4', 'webm', 'mobileMp4', 'mobileWebm') if scene == 'hero' else VARIANTS
        video_probes = {}
        for variant in variants:
            video_probes[variant] = probe(files[variant], 'vp9' if variant.lower().endswith('webm') else 'h264')
        mp4 = video_probes['mp4']
        webm = video_probes['webm']
        require((mp4['width'], mp4['height'], mp4['frames']) ==
                (webm['width'], webm['height'], webm['frames']), 'Codec derivatives disagree')
        if scene == 'hero':
            mobile = video_probes['mobileMp4']
            mobile_webm = video_probes['mobileWebm']
            require((mobile['width'], mobile['height'], mobile['frames']) ==
                    (mobile_webm['width'], mobile_webm['height'], mobile_webm['frames']) and
                    mobile['height'] > mobile['width'] and mp4['width'] > mp4['height'],
                    'Hero desktop/portrait variant codec or framing mismatch')
        stats = motion_stats(decoded_luma_frames(files['mp4'], mp4['frames']))
        concerns = []
        if mp4['width'] < 1920 or mp4['height'] < 1080:
            concerns.append('not_native_1080p_or_4k')
        if stats['seam_to_adjacency_ratio'] > 3:
            concerns.append('loop_seam_needs_visual_review')
        if stats['quarter_cycle_mad'] < .3:
            concerns.append('subtle_or_insufficient_visible_motion')
        records.append({'scene': scene, 'encodes': video_probes,
                        'temporal': stats, 'review_concerns': concerns})
    result = {'session': 'ANEVUM.WEB.TEST.2026-11-14.016.CINEMATIC-MASTER-QA',
              'status': STATUS, 'published': False, 'rights_verified': False,
              'owner_accepted': False, 'safari_verified': False,
              'source_manifest_sha256': digest((root / 'manifest.json').read_bytes()),
              'scenes': records,
              'note': 'Motion statistics are diagnostics, not proof of physical realism or art approval.'}
    output.parent.mkdir(parents=True, exist_ok=True)
    stage = Path(mkdtemp(prefix=output.name + '.pending-', dir=output.parent))
    try:
        (stage / 'cinematic-motion-qc.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf8')
        if sheet:
            render_contact_sheet(bundle['scenes'], stage / 'cinematic-motion-contact-sheet.png')
        require(not output.exists() and not output.is_symlink(), 'QC output changed during audit')
        stage.rename(output)
    finally:
        if stage.exists():
            shutil.rmtree(stage)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('review', type=Path, help='Extracted V32 review directory')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--no-sheet', action='store_true')
    args = parser.parse_args()
    result = audit(args.review, args.out, sheet=not args.no_sheet)
    print(json.dumps({'status': result['status'], 'scenes': len(result['scenes']),
                      'report': str(args.out / 'cinematic-motion-qc.json'),
                      'accepted_for_publication': False}))


if __name__ == '__main__':
    main()
