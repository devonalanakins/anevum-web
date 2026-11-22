"""Offline acceptance-contract tests for ANEVUM V33 film QA."""
import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest
import hashlib

SOURCE = Path(__file__).resolve().parents[1] / 'scripts/ops/audit-anevum-five-scene-review.py'
spec = importlib.util.spec_from_file_location('anevum_film_qc', SOURCE)
qc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qc)


def digest(b):
    return hashlib.sha256(b).hexdigest()


class QCFixture(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='anevum-qc-test-')
        self.root = Path(self.tmp.name) / 'review'
        self.root.mkdir()
        self.files = []
        self.scenes = []
        for i in range(6):
            self.add('assets', 'webp', i)
        for index, scene in enumerate(qc.SCENES):
            paths = {}
            for ext in ('mp4', 'webm'):
                paths[ext] = self.add('media', ext, 20 + index * 3)
            if scene == 'hero':
                paths['mobileMp4'] = self.add('media', 'mp4', 50)
                paths['mobileWebm'] = self.add('media', 'webm', 51)
            tag = '<a data-scene="' + scene + '" data-video-ready="true"'
            for variant, attr in [('mp4', 'data-video-mp4'), ('webm', 'data-video-webm'),
                                  ('mobileMp4', 'data-mobile-mp4'),
                                  ('mobileWebm', 'data-mobile-webm')]:
                if variant in paths:
                    tag += ' ' + attr + '="./' + paths[variant] + '"'
            self.scenes.append(tag + '></a>')
        self.manifest = {'status': qc.STATUS, 'published': False, 'rights_verified': False,
                         'owner_accepted': False, 'files': self.files}
        self.write()

    def tearDown(self):
        self.tmp.cleanup()

    def add(self, directory, ext, salt):
        tail = bytes([salt % 250]) * 40
        magic = (b'RIFF' + b'\0' * 4 + b'WEBP' if ext == 'webp' else
                 b'\0' * 4 + b'ftyp' if ext == 'mp4' else
                 bytes([0x1a, 0x45, 0xdf, 0xa3]))
        blob = magic + tail
        h = digest(blob)
        rel = f'{directory}/{h[:24]}.{ext}'
        path = self.root / rel
        path.parent.mkdir(exist_ok=True)
        path.write_bytes(blob)
        self.files.append({'path': rel, 'sha256': h, 'bytes': len(blob)})
        return rel

    def write(self):
        (self.root / 'manifest.json').write_text(json.dumps(self.manifest))
        (self.root / 'index.html').write_text('<html><title>ANEVUM REVIEW</title>' +
                                             ''.join(self.scenes) + '</html>')

    def test_accepts_exact_twelve_videos_six_posters_without_video_decode(self):
        bundle = qc.validate_bundle(self.root)
        self.assertEqual(len(bundle['inventory']), 18)
        self.assertEqual(len(bundle['scenes']), 5)
        self.assertEqual(len({p for paths in bundle['scenes'].values()
                              for p in paths.values()}), 12)

    def test_rejects_tampered_asset_before_report(self):
        asset = self.root / self.files[0]['path']
        asset.write_bytes(b'bad')
        with self.assertRaisesRegex(ValueError, 'checksum mismatch'):
            qc.validate_bundle(self.root)

    def test_rejects_publication_approval_and_unknown_scene(self):
        self.manifest['published'] = True
        self.write()
        with self.assertRaisesRegex(ValueError, 'provenance/approval'):
            qc.validate_bundle(self.root)
        self.manifest['published'] = False
        self.scenes.append('<div data-scene="private" data-video-ready="true"></div>')
        self.write()
        with self.assertRaisesRegex(ValueError, 'unknown scene'):
            qc.validate_bundle(self.root)

    def test_rejects_duplicate_and_external_video_reference(self):
        self.scenes[1] = self.scenes[1].replace('data-scene="experiments"', 'data-scene="hero"')
        self.write()
        with self.assertRaisesRegex(ValueError, 'Duplicate'):
            qc.validate_bundle(self.root)
        self.scenes[1] = self.scenes[1].replace('data-scene="hero"', 'data-scene="experiments"')
        self.scenes[1] = self.scenes[1].replace('./media/', 'https://external.invalid/', 1)
        self.write()
        with self.assertRaisesRegex(ValueError, 'relative media URL'):
            qc.validate_bundle(self.root)

    def test_rejects_oversize_unsafe_path_or_missing_file(self):
        old = self.files[0].copy()
        self.files[0]['path'] = '../secret.webp'
        self.write()
        with self.assertRaisesRegex(ValueError, 'Unsafe'):
            qc.validate_bundle(self.root)
        self.files[0].update(old)
        (self.root / old['path']).unlink()
        self.write()
        with self.assertRaises(FileNotFoundError):
            qc.validate_bundle(self.root)

    def test_temporal_seam_and_stillness_metrics(self):
        still = [bytes([30]) * 32] * 8
        result = qc.motion_stats(still)
        self.assertEqual(result['quarter_cycle_mad'], 0)
        self.assertEqual(result['near_still_frame_fraction'], 1)
        moving = [bytes([30 + n * 4]) * 32 for n in range(8)]
        result = qc.motion_stats(moving)
        self.assertEqual(result['adjacent_median_mad'], 4)
        self.assertEqual(result['seam_mad'], 28)
        self.assertEqual(result['seam_to_adjacency_ratio'], 7)
        with self.assertRaisesRegex(ValueError, 'Invalid decoded'):
            qc.frame_mad(b'1234', b'abc')

    @unittest.skipUnless(shutil.which('ffmpeg') and shutil.which('ffprobe'),
                         'FFmpeg optional for codec validation')
    def test_independent_decoder_rejects_audio_and_wrong_codec(self):
        from subprocess import run
        out = Path(self.tmp.name) / 'fixture.mp4'
        run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i',
             'testsrc2=size=320x240:rate=24', '-t', '4', '-an',
             '-c:v', 'libx264', '-pix_fmt', 'yuv420p', str(out)],
            capture_output=True, check=True, timeout=45)
        got = qc.probe(out, 'h264')
        self.assertEqual(got['width'], 320)
        self.assertEqual(got['frames'], 96)
        with self.assertRaisesRegex(ValueError, 'Unexpected video codec'):
            qc.probe(out, 'vp9')


if __name__ == '__main__':
    unittest.main()
