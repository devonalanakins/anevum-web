import ast
import importlib.util
import math
from pathlib import Path
import unittest

SOURCE = Path(__file__).resolve().parents[1] / 'scripts/ops/render-anevum-archive-image-led-v31.py'
TEXT = SOURCE.read_text(encoding='utf8')
try:
    import cv2
    import numpy as np
    GRAPHICS = True
except ImportError:
    GRAPHICS = False
if GRAPHICS:
    spec = importlib.util.spec_from_file_location('anevum_archive_v31', SOURCE)
    renderer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(renderer)


class SourceSafety(unittest.TestCase):
    def test_parser_and_publication_gates(self):
        funcs = {n.name for n in ast.walk(ast.parse(TEXT)) if isinstance(n, ast.FunctionDef)}
        self.assertTrue({'setup', 'frame', 'render', 'main'}.issubset(funcs))
        for term in ('REVIEW_ONLY_NOT_PRODUCTION_APPROVED', 'publication_authorized=False',
                     'owner_accepted=False', 'rights_verified=False', 'source_native_4k=False',
                     'Refusing to overwrite existing review media'):
            self.assertIn(term, TEXT)
        # Require the exact periodic phase warp; the static runner can catch drift.
        self.assertIn('phase -= .42 * math.sin(2 * phase)', TEXT)
        for term in ('https://', 'wrangler', 'boto3', 'requests.post', 'Cloudflare'):
            self.assertNotIn(term, TEXT)


@unittest.skipUnless(GRAPHICS, 'Frame-level QA requires NumPy and OpenCV')
class FrameQA(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        h, w = 510, 1050
        yy, xx = np.mgrid[:h, :w].astype(np.float32)
        spine = (np.cos(xx / 11.0) ** 18) * (yy < 280)
        warmth = np.exp(-.5 * ((xx - 580) / 340) ** 2) * (yy < 310)
        base = np.zeros((h, w, 3), np.uint8)
        base[..., 0] = np.uint8(np.clip(13 + 25 * spine + 12 * warmth, 0, 255))
        base[..., 1] = np.uint8(np.clip(15 + 54 * spine + 23 * warmth, 0, 255))
        base[..., 2] = np.uint8(np.clip(18 + 77 * spine + 35 * warmth, 0, 255))
        base[365:] = 8
        cls.layers = renderer.setup(base)

    def test_exact_loop_closure(self):
        self.assertTrue(np.array_equal(renderer.frame(self.layers, 0),
                                       renderer.frame(self.layers, math.tau)))

    def test_visible_light_changes_and_book_geometry_remains_still(self):
        first = renderer.frame(self.layers, 0)
        quarter = renderer.frame(self.layers, math.pi / 2)
        delta = np.abs(first.astype(np.float32) - quarter.astype(np.float32))
        self.assertGreater(float(delta[:320].mean()), .06)
        self.assertTrue(np.array_equal(first[357:], quarter[357:]))
        self.assertTrue(np.array_equal(first[357:], self.layers['base'][357:]))

    def test_last_frame_is_close_to_first(self):
        first = renderer.frame(self.layers, 0).astype(np.float32)
        last = renderer.frame(self.layers, math.tau * 143 / 144).astype(np.float32)
        self.assertLess(float(np.abs(first - last).mean()), .28)

    def test_loop_seam_is_smooth_without_suppressing_quarter_cycle_light(self):
        first = renderer.frame(self.layers, 0).astype(np.float32)
        last = renderer.frame(self.layers, math.tau * 143 / 144).astype(np.float32)
        quarter = renderer.frame(self.layers, math.pi / 2).astype(np.float32)
        seam = float(np.abs(first - last).mean())
        travel = float(np.abs(first - quarter).mean())
        # Original phase had >0.09 pixel MAE; the eased loop keeps real travel.
        self.assertLess(seam, .04)
        self.assertGreater(travel, .50)
        self.assertLess(seam / travel, .04)

    def test_reject_unusable_artwork(self):
        for bad in (None, np.zeros((100, 300, 3), np.uint8),
                    np.zeros((510, 1051, 3), np.uint8),
                    np.zeros((510, 1050), np.uint8)):
            with self.assertRaises(ValueError):
                renderer.setup(bad)


if __name__ == '__main__':
    unittest.main()
