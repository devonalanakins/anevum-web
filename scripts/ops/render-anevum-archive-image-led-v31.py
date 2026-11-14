#!/usr/bin/env python3
"""ANEVUM.WEB.BUILD.2026-11-14.014.ARCHIVAL-LIGHT-TRANSPORT

Create a local-only image-led Archive motion study using the existing library
plate: a moving amber pool of light and source-registered glints on embossed
book spines, with very faint backlit dust. Boundaries and printed details never
morph, and the lower HTML copy-safe band stays pixel-identical to the source.
No network or publication. The source artwork's rights are not yet cleared.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path

import cv2
import numpy as np

SESSION = 'ANEVUM.WEB.BUILD.2026-11-14.014.ARCHIVAL-LIGHT-TRANSPORT'
STATUS = 'REVIEW_ONLY_NOT_PRODUCTION_APPROVED'


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as src:
        for chunk in iter(lambda: src.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def setup(image: np.ndarray) -> dict:
    if image is None or image.ndim != 3 or image.shape[2] != 3:
        raise ValueError('Three-channel source artwork required')
    h, w = image.shape[:2]
    if w < 900 or h < 450 or w % 2 or h % 2:
        raise ValueError('Source artwork must be even-sized and at least 900x450')
    y, x = np.mgrid[:h, :w].astype(np.float32)
    xn, yn = x / w, y / h
    b, g, r = [image[:, :, k].astype(np.float32) for k in range(3)]
    luminance = 0.114 * b + 0.587 * g + 0.299 * r
    # The native copy overlay and hard frame edges remain unchanged.
    copy_safe = np.clip((.68 - yn) / .19, 0, 1).astype(np.float32)
    border_safe = np.clip(np.minimum.reduce([
        x / 22, (w - 1 - x) / 22, y / 15, (h - 1 - y) / 15
    ]), 0, 1).astype(np.float32)
    safe = copy_safe * border_safe
    # Find source leather/gilding, never synthesize rings, books or lettering.
    warm = np.clip((r - b * 1.05 - 11) / 74, 0, 1)
    warm *= np.clip((g - b * .80 - 6) / 67, 0, 1)
    warm *= np.clip((luminance - 15) / 90, 0, 1) * safe
    leather_surface = np.clip((luminance - 7) / 95, 0, 1) * safe
    detail = cv2.morphologyEx(luminance, cv2.MORPH_TOPHAT,
                              cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    emboss = np.clip((detail - 2.6) / 31, 0, 1) * warm
    emboss = cv2.GaussianBlur(emboss.astype(np.float32), (0, 0), .75)
    shelf = np.exp(-.5 * ((yn - .245) / .265) ** 2).astype(np.float32) * safe
    rng = np.random.default_rng(310014)
    particles = []
    for _ in range(42):
        particles.append((float(rng.uniform(.08, .96)),
                          float(rng.uniform(.07, .53)),
                          float(rng.uniform(.25, 1.0)),
                          float(rng.uniform(-math.pi, math.pi)),
                          int(rng.choice([1, 2]))))
    return dict(base=image, x=x, y=y, xn=xn, yn=yn, w=w, h=h, warm=warm.astype(np.float32),
                emboss=emboss.astype(np.float32), leather_surface=leather_surface.astype(np.float32),
                shelf=shelf, safe=safe, particles=particles)


def frame(layers: dict, phase: float) -> np.ndarray:
    """Cyclic illumination with stable book geometry and no source regeneration."""
    phase %= math.tau
    x, y, xn, yn = layers['x'], layers['y'], layers['xn'], layers['yn']
    h, w = layers['h'], layers['w']
    base = layers['base'].astype(np.float32)
    center = .48 + .30 * math.sin(phase + .24)
    falloff = np.exp(-.5 * ((xn - center - .10 * (yn - .25)) / .19) ** 2).astype(np.float32)
    secondary = .35 * np.exp(-.5 * ((xn - center + .31) / .11) ** 2).astype(np.float32)
    light = (falloff + secondary) * layers['shelf']
    glint = layers['emboss'] * (light ** 1.45)
    leather = layers['warm'] * light * (.34 + .15 * math.cos(phase - .2))
    out = base.copy()
    out += (layers['leather_surface'] * light)[:, :, None] * np.array([8., 16., 30.], np.float32)
    out += leather[:, :, None] * np.array([7., 17., 32.], np.float32)
    out += glint[:, :, None] * np.array([18., 42., 70.], np.float32)
    # Breathe light only where existing shelf illumination already occurs.
    breath = .5 + .5 * math.cos(phase + .85)
    out += (layers['warm'] * layers['shelf'] * breath)[:, :, None] * np.array([1.5, 4., 7.], np.float32)
    dust = np.zeros((h, w), dtype=np.float32)
    for px, py, depth, offset, speed in layers['particles']:
        dx = (2.7 + depth * 4.0) * (math.sin(speed * phase + offset) - math.sin(offset))
        dy = (1.3 + depth * 2.8) * (math.cos(phase + offset) - math.cos(offset))
        ix, iy = int(round(px * w + dx)), int(round(py * h + dy))
        if not (3 <= ix < w - 3 and 3 <= iy < h - 3):
            continue
        illumination = float(layers['shelf'][iy, ix] * light[iy, ix])
        if illumination < .18:
            continue
        cv2.circle(dust, (ix, iy), 1 if depth < .65 else 2,
                   .24 * depth * illumination, -1, cv2.LINE_AA)
    dust = cv2.GaussianBlur(dust, (0, 0), .9)
    out += dust[:, :, None] * np.array([19., 31., 49.], np.float32)
    out[int(.70 * h):] = base[int(.70 * h):]
    return np.clip(out, 0, 255).astype(np.uint8)


def render(poster: Path, out: Path, seconds: int = 6, fps: int = 24) -> dict:
    if seconds not in (4, 6, 8) or fps not in (12, 24, 30):
        raise ValueError('Unsupported review duration or frame rate')
    if out.exists() or out.with_suffix('.review.json').exists():
        raise FileExistsError('Refusing to overwrite existing review media or receipt')
    layers = setup(cv2.imread(str(poster), cv2.IMREAD_COLOR))
    h, w = layers['h'], layers['w']
    count = seconds * fps
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-f', 'rawvideo',
           '-pixel_format', 'bgr24', '-video_size', f'{w}x{h}', '-framerate', str(fps),
           '-i', 'pipe:0', '-an', '-c:v', 'libx264', '-crf', '19', '-preset', 'veryfast',
           '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-threads', '3', str(out)]
    encoder = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        for i in range(count):
            encoder.stdin.write(frame(layers, math.tau * i / count).tobytes())
    except (OSError, BrokenPipeError) as exc:
        encoder.kill()
        raise RuntimeError('Review encoder failed before all frames were delivered') from exc
    finally:
        if encoder.stdin and not encoder.stdin.closed:
            encoder.stdin.close()
    stderr = encoder.stderr.read().decode('utf-8', 'replace')
    if encoder.wait() != 0:
        raise RuntimeError('FFmpeg error: ' + stderr[-800:])
    receipt = dict(session=SESSION, status=STATUS, scene='archive',
                   technique='source-registered leather embossing and travelling warm light',
                   source_sha256=digest(poster), file_sha256=digest(out),
                   bytes=out.stat().st_size, width=w, height=h, fps=fps,
                   frames=count, duration_seconds=seconds,
                   owner_accepted=False, rights_verified=False, publication_authorized=False,
                   source_native_4k=False, architectural_geometry_animated=False)
    out.with_suffix('.review.json').write_text(json.dumps(receipt, indent=2) + '\n')
    return receipt


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--poster', required=True, type=Path)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--seconds', type=int, default=6)
    parser.add_argument('--fps', type=int, default=24)
    args = parser.parse_args()
    print(json.dumps(render(args.poster, args.out, args.seconds, args.fps), indent=2))


if __name__ == '__main__':
    main()
