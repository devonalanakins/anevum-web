"""Offline ANEVUM V12 material and source-safety contracts (stdlib only).

These checks never render media, contact services, or activate a Worker.
Renderer integration and actual moving-browser checks are separate gates.
"""
import ast
import math
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "scripts" / "ops"
SHADER_DIR = ROOT
if str(SHADER_DIR) not in sys.path:
    sys.path.insert(0, str(SHADER_DIR))
from anevum_metal_shader import copper_bgr, fresnel_schlick, ggx_distribution, tone


class MetalShaderTests(unittest.TestCase):
    def test_deterministic_and_bounded_bgr(self):
        args=((0.24, 0.67, 0.73), 0.17, 0.92, 0)
        first = copper_bgr(*args)
        self.assertEqual(first, copper_bgr(*args))
        self.assertEqual(len(first), 3)
        self.assertTrue(all(isinstance(v, int) and 0 <= v <= 255 for v in first))

    def test_material_changes_with_normal_and_roughness(self):
        values = {
            copper_bgr((0, 0, 1), 0.13, 1, 0, roughness=0.20),
            copper_bgr((0.8, 0, 0.6), 0.13, 1, 0, roughness=0.20),
            copper_bgr((0, 0, 1), 0.13, 1, 0, roughness=0.60),
        }
        self.assertGreaterEqual(len(values), 2, 'Material must respond to geometry and roughness')

    def test_fresnel_and_distribution_are_bounded_and_finite(self):
        for x in (0, 0.2, 0.5, 1):
            f = fresnel_schlick(x)
            self.assertEqual(len(f), 3)
            self.assertTrue(all(math.isfinite(v) and 0 <= v <= 1 for v in f))
            for r in (0.15, 0.3, 0.75):
                self.assertTrue(math.isfinite(ggx_distribution(x, r)))
                self.assertGreaterEqual(ggx_distribution(x, r), 0)
        self.assertTrue(all(math.isfinite(tone(v)) for v in (0, 0.1, 1, 8)))

    def test_nonfinite_input_fails_closed(self):
        for args in [((float('nan'), 0, 1), 0, 1, 0),
                     ((0, 0, 1), float('inf'), 1, 0),
                     ((0, 0, 1), 0, float('nan'), 0)]:
            with self.subTest(args=args), self.assertRaises(ValueError):
                copper_bgr(*args)
        with self.assertRaises(ValueError):
            copper_bgr((0, 0, 1), 0, 1, 0, roughness=float('nan'))

    def test_renderer_source_retains_review_only_boundaries(self):
        source = (ROOT / 'render_anevum_armillary_v12.py').read_text()
        ast.parse(source)
        for contract in ('production_eligible\':False', 'owner_approved\':False',
                         "'-c:v','ffv1'", 'derived_from_master_sha256',
                         'world_geometry_endpoints()', "'--preview-only'",
                         "'--keep-master'", 'assert np.array_equal(first,scene.frame(count,count))'):
            self.assertIn(contract, source, contract)
        self.assertNotIn('requests.', source)
        self.assertNotIn('cloudflare', source.lower())
        self.assertNotIn('wrangler deploy', source)
        self.assertNotIn('data-video-ready="true"', source)


if __name__ == '__main__':
    unittest.main()
