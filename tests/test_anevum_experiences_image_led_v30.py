import ast
import importlib.util
import math
from pathlib import Path
import unittest

SOURCE = Path(__file__).resolve().parents[1] / 'scripts/ops/render-anevum-experiences-image-led-v30.py'
TEXT = SOURCE.read_text(encoding='utf8')

try:
    import cv2
    import numpy as np
    GRAPHICS_AVAILABLE = True
except ImportError:
    GRAPHICS_AVAILABLE = False

if GRAPHICS_AVAILABLE:
    spec = importlib.util.spec_from_file_location('anevum_experiences_v30', SOURCE)
    renderer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(renderer)


class StaticSafety(unittest.TestCase):
    def test_parses_and_exposes_offline_renderer(self):
        tree = ast.parse(TEXT)
        names = {n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)}
        self.assertTrue({'setup', 'frame', 'render', 'main'}.issubset(names))
        self.assertIn('REVIEW_ONLY_NOT_PRODUCTION_APPROVED', TEXT)

    def test_no_publication_or_surprise_overwrite(self):
        for assertion in ('publication_authorized=False', 'rights_verified=False',
                          'owner_accepted=False', 'source_native_4k=False',
                          'Never overwrite a previous review artifact'):
            self.assertIn(assertion, TEXT)
        for banned in ('https://', 'wrangler', 'boto3', 'requests.post', 'Cloudflare'):
            self.assertNotIn(banned, TEXT)


@unittest.skipUnless(GRAPHICS_AVAILABLE, 'Optional NumPy/OpenCV required for frame QA')
class MotionQA(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        w, h = 1050, 510
        y, x = np.mgrid[:h, :w].astype(np.float32)
        canopy = np.clip((.5 + .5 * np.sin(x / 9) * np.cos(y / 14)), 0, 1)
        flanks = ((x < 370) | (x > 870)) & (y < 310)
        bright = np.exp(-.5 * (((x-700)/220)**2 + ((y-135)/110)**2))
        plate = np.zeros((h, w, 3), dtype=np.uint8)
        plate[..., 0] = np.uint8(np.clip(18+110*bright+10*canopy*flanks,0,255))
        plate[..., 1] = np.uint8(np.clip(20+114*bright+96*canopy*flanks,0,255))
        plate[..., 2] = np.uint8(np.clip(22+118*bright+108*canopy*flanks,0,255))
        plate[385:] = 8
        cls.layers = renderer.setup(plate)

    def test_loop_closure_is_pixel_exact(self):
        self.assertTrue(np.array_equal(renderer.frame(self.layers, 0),
                                       renderer.frame(self.layers, math.tau)))

    def test_rendered_end_frame_is_near_first(self):
        first = renderer.frame(self.layers, 0)
        last = renderer.frame(self.layers, math.tau * 143 / 144)
        distance = np.abs(first.astype(np.float32)-last.astype(np.float32)).mean()
        self.assertLess(float(distance), .25)

    def test_foliage_fog_change_while_lower_copy_stays_exact(self):
        first = renderer.frame(self.layers, 0)
        mid = renderer.frame(self.layers, math.pi/2)
        difference = np.abs(first.astype(np.float32)-mid.astype(np.float32))
        self.assertGreater(float(difference[:360].mean()), .18)
        self.assertTrue(np.array_equal(first[382:], mid[382:]))
        self.assertTrue(np.array_equal(first[382:], self.layers['base'][382:]))

    def test_reject_bad_dimensions_and_channels(self):
        for image in [None, np.zeros((510, 1050),dtype=np.uint8),
                      np.zeros((200,300,3),dtype=np.uint8),
                      np.zeros((510,1051,3),dtype=np.uint8)]:
            with self.assertRaises(ValueError): renderer.setup(image)


if __name__ == '__main__': unittest.main()
