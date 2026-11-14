import ast
import importlib.util
import math
from pathlib import Path
import unittest

SOURCE = Path(__file__).resolve().parents[1] / "scripts/ops/render-anevum-experiments-image-led-v29.py"
SOURCE_TEXT = SOURCE.read_text(encoding="utf8")

try:
    import numpy as np
    import cv2
    GRAPHICS_AVAILABLE = True
except ImportError:
    GRAPHICS_AVAILABLE = False

if GRAPHICS_AVAILABLE:
    spec = importlib.util.spec_from_file_location("anevum_experiments_v29", SOURCE)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)


class ExperimentsStaticSafety(unittest.TestCase):
    def test_source_parses_without_optional_graphics_dependencies(self):
        tree = ast.parse(SOURCE_TEXT)
        funcs = {node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)}
        self.assertTrue({"setup", "frame", "render", "main"}.issubset(funcs))

    def test_review_only_and_no_network_publishing(self):
        self.assertIn("REVIEW_ONLY_NOT_PRODUCTION_APPROVED", SOURCE_TEXT)
        self.assertIn("'owner_accepted':False", SOURCE_TEXT)
        self.assertIn("'publication_authorized':False", SOURCE_TEXT)
        self.assertIn("'source_native_4k':False", SOURCE_TEXT)
        self.assertNotIn("https://", SOURCE_TEXT)
        self.assertNotIn("wrangler", SOURCE_TEXT)
        self.assertIn("if out.exists()", SOURCE_TEXT)


@unittest.skipUnless(GRAPHICS_AVAILABLE, "Frame-level tests require optional NumPy and OpenCV")
class ExperimentsFrameMotion(unittest.TestCase):
    def setUp(self):
        h, w = 510, 1050
        y, x = np.mgrid[:h, :w]
        image = np.zeros((h, w, 3), dtype=np.uint8)
        radius = np.sqrt(((x - 660) / 240) ** 2 + ((y - 165) / 140) ** 2)
        angle = np.arctan2(y - 165, x - 660)
        ring = np.exp(-3 * (radius - .6 - .1 * np.cos(3 * angle)) ** 2)
        image[:, :, 2] = np.uint8(np.clip(100 * ring + 65 * np.exp(-4 * radius ** 2), 0, 255))
        image[:, :, 1] = np.uint8(np.clip(70 * ring + 55 * np.exp(-4 * radius ** 2), 0, 255))
        image[:, :, 0] = np.uint8(np.clip(45 * ring, 0, 255))
        self.layers = module.setup(image)

    def test_exact_loop_closure(self):
        self.assertTrue(np.array_equal(
            module.frame(self.layers, 0),
            module.frame(self.layers, math.tau)
        ))

    def test_spiral_moves_but_lower_safe_zone_stays_still(self):
        initial = module.frame(self.layers, 0)
        quarter = module.frame(self.layers, math.pi / 2)
        self.assertGreater(
            float(np.mean(np.abs(initial.astype(np.float32) - quarter.astype(np.float32)))),
            0.07
        )
        self.assertTrue(np.array_equal(initial[-20:], quarter[-20:]))

    def test_refuses_invalid_and_low_resolution_plates(self):
        with self.assertRaises(ValueError):
            module.setup(np.zeros((50, 80, 3), dtype=np.uint8))
        with self.assertRaises(ValueError):
            module.setup(np.zeros((510, 1051, 3), dtype=np.uint8))


if __name__ == "__main__":
    unittest.main()
