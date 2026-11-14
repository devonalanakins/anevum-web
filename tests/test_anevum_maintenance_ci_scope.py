"""Offline boundary tests for maintenance-only UI preview classification."""
import importlib.util
from pathlib import Path
import unittest
target=Path(__file__).resolve().parents[1]/'scripts/ops/anevum-maintenance-ci-scope.py'
spec=importlib.util.spec_from_file_location('ci_scope',target)
scope=importlib.util.module_from_spec(spec)
spec.loader.exec_module(scope)

class ScopeTests(unittest.TestCase):
    def test_reviewed_maintenance_paths_do_not_change_app_runtime(self):
        self.assertFalse(scope.app_preview_required(list(scope.MAINTENANCE_PATHS)))

    def test_repo_extraction_metadata_does_not_need_anevum_web_preview(self):
        approved = [
            ".github/workflows/deploy-brandle.yml",
            ".github/workflows/export-brandle-source.yml",
            ".github/workflows/repository-split-verify.yml",
            "apps/cristybreathe/.github/workflows/ci.yml",
            "apps/cristybreathe/LICENSE",
            "docs/REPOSITORY_ARCHITECTURE.md",
            "games/brandle/.github/workflows/ci.yml",
            "games/brandle/.gitignore",
            "games/brandle/LICENSE",
            "games/brandle/README.md",
            "scripts/ops/repo-catalog.json",
            "scripts/ops/split-project.mjs",
            "tests/repository-split.test.mjs"
        ]
        self.assertFalse(scope.app_preview_required(approved))

    def test_cross_repo_verifier_uses_ci_gate_not_hosted_preview(self):
        ci_only = [
            "scripts/verify-v5-cross-repo-schema.mjs",
            "tests/v5-cross-repo-schema.test.mjs",
        ]
        public = ["apps/anevum-public-studio/worker.mjs"]
        self.assertFalse(scope.app_preview_required(ci_only))
        self.assertFalse(scope.public_studio_required(ci_only))
        self.assertFalse(scope.app_preview_required(ci_only + public))
        self.assertTrue(scope.public_studio_required(ci_only + public))
        # An unrelated/private runtime change still fails closed through the
        # existing Cloudflare Access requirement before any hosted preview.
        for protected in ("src/App.tsx", "worker.mjs", "wrangler.jsonc"):
            with self.subTest(protected=protected):
                self.assertTrue(scope.app_preview_required(ci_only + public + [protected]))
        workflow = (target.parents[2] / ".github/workflows/anevum-verify.yml").read_text()
        self.assertIn("Enforce pinned WEB/RHEN cross-repository workspace schema parity", workflow)
        self.assertIn("run: node scripts/verify-v5-cross-repo-schema.mjs", workflow)
        self.assertIn("steps.scope.outputs.app_preview_required == 'true'", workflow)
        self.assertIn("Verify owner-only Access before hosted Cloudflare Preview", workflow)

    def test_root_readme_only_does_not_require_preview(self):
        self.assertFalse(scope.app_preview_required(["README.md"]))

    def test_readme_plus_runtime_requires_preview(self):
        self.assertTrue(scope.app_preview_required(["README.md", "src/App.tsx"]))

    def test_application_source_changes_still_require_preview(self):
        for path in ("apps/cristybreathe/src/worker.mjs",
                     "games/brandle/app.mjs",
                     "games/brandle/build-worker.mjs",
                     "src/App.tsx",
                     "worker.mjs"):
            with self.subTest(path=path):
                self.assertTrue(scope.app_preview_required([
                    "docs/REPOSITORY_ARCHITECTURE.md", path]))

    def test_any_unknown_runtime_or_build_input_requires_preview(self):
        for path in ('src/App.tsx','worker.mjs','wrangler.jsonc','package.json',
                     'creator-v1/web/src/App.tsx','scripts/build.mjs',
                     '.github/workflows/new-release.yml','tests/new-test.mjs',
                     'tests/../src/App.tsx',''):
            with self.subTest(path=path):
                self.assertTrue(scope.app_preview_required([
                    'scripts/ops/anevum-progression-reset-20261021.py',path]))

    def test_isolated_reviewer_files_use_separate_review_gate(self):
        paths = list(scope.ISOLATED_ORIGINAL_WORKS_REVIEW_PATHS)
        self.assertEqual(len(paths), 6)
        self.assertFalse(scope.app_preview_required(paths))
        self.assertTrue(scope.isolated_review_required(paths))

    def test_review_files_with_maintenance_still_require_review(self):
        paths = ["README.md", "scripts/ops/anevum-maintenance-ci-scope.py",
                 "scripts/ops/original-works-review-worker.mjs"]
        self.assertFalse(scope.app_preview_required(paths))
        self.assertTrue(scope.isolated_review_required(paths))

    def test_any_real_application_change_keeps_legacy_preview_required(self):
        for application_path in ["src/App.tsx", "worker.mjs", "wrangler.jsonc",
                                 "src/data/transcosmic-wiki.ts", "scripts/new-build.mjs"]:
            paths = ["scripts/ops/original-works-review-worker.mjs", application_path]
            with self.subTest(path=application_path):
                self.assertTrue(scope.app_preview_required(paths))
                self.assertTrue(scope.isolated_review_required(paths))

    def test_unknown_reviewer_file_cannot_bypass_preview(self):
        paths = ["scripts/ops/original-works-review-worker.mjs",
                 "scripts/ops/new-review-worker.mjs"]
        self.assertTrue(scope.app_preview_required(paths))
        self.assertTrue(scope.isolated_review_required(paths))

    def test_unrelated_maintenance_does_not_trigger_reviewer_build(self):
        self.assertFalse(scope.isolated_review_required(["README.md"]))
        self.assertFalse(scope.isolated_review_required([]))

    def test_public_studio_has_separate_mandatory_no_deploy_review(self):
        paths = list(scope.ISOLATED_PUBLIC_STUDIO_PATHS)
        self.assertEqual(len(paths), 36)
        self.assertFalse(scope.app_preview_required(paths))
        self.assertTrue(scope.public_studio_required(paths))
        self.assertFalse(scope.isolated_review_required(paths))

    def test_exact_canonical_root_runbook_is_reviewed_but_unreviewed_docs_fail_closed(self):
        approved = "docs/design/ANEVUM.WEB.OPS.2026-11-03.027.CANONICAL-ORIGINAL-WORKS-LAUNCH.md"
        runtime = "apps/anevum-public-studio/worker.mjs"
        self.assertIn(approved, scope.ISOLATED_PUBLIC_STUDIO_PATHS)
        self.assertFalse(scope.app_preview_required([runtime, approved]))
        self.assertTrue(scope.public_studio_required([runtime, approved]))
        self.assertTrue(scope.app_preview_required([
            runtime, "docs/design/ANEVUM.WEB.OPS.2026-11-03.999.UNREVIEWED-RELEASE.md"
        ]))

    def test_unrelated_application_edits_still_require_legacy_preview(self):
        files = ["apps/anevum-public-studio/worker.mjs", "src/App.tsx"]
        self.assertTrue(scope.app_preview_required(files))
        self.assertTrue(scope.public_studio_required(files))

    def test_image_assets_are_isolated_but_unknown_images_fail_closed(self):
        known = ["apps/anevum-public-studio/art/lab-hero-v1.webp",
                 "apps/anevum-public-studio/living-laboratory-art.mjs"]
        self.assertFalse(scope.app_preview_required(known))
        self.assertTrue(scope.public_studio_required(known))
        unknown = ["apps/anevum-public-studio/art/unreviewed-v2.webp"]
        self.assertTrue(scope.app_preview_required(known + unknown))
        self.assertTrue(scope.public_studio_required(known + unknown))

    def test_exact_cinematic_review_files_stay_in_public_safety_gate(self):
        reviewed = [
            "apps/anevum-public-studio/review/cinematic-laboratory.html",
            "apps/anevum-public-studio/review/assets/hero.webp",
            "apps/anevum-public-studio/review/assets/hero-mobile.webp",
            "apps/anevum-public-studio/review/assets/experiments.webp",
            "apps/anevum-public-studio/review/assets/research.webp",
            "apps/anevum-public-studio/review/assets/experiences.webp",
            "apps/anevum-public-studio/review/assets/archive.webp",
            "docs/design/ANEVUM.WEB.DESIGN.2026-11-13.002.CINEMATIC-LABORATORY-PRODUCTION.md",
            "tests/anevum-cinematic-review.test.mjs",
            "scripts/ops/anevum-cinematic-local-preview.mjs",
            "tests/anevum-cinematic-local-preview.test.mjs",
            ".github/workflows/anevum-verify.yml",
            "scripts/ops/anevum-maintenance-ci-scope.py",
            "tests/test_anevum_maintenance_ci_scope.py",
        ]
        self.assertFalse(scope.app_preview_required(reviewed))
        self.assertTrue(scope.public_studio_required(reviewed))
        # Unknown review, future media, private runtime, and auth changes must
        # never inherit this restricted review-only exception.
        for unknown in ("apps/anevum-public-studio/review/unknown.html",
                        "apps/anevum-public-studio/art/hero-v2.webp",
                        "src/App.tsx", "worker.mjs"):
            with self.subTest(unknown=unknown):
                self.assertTrue(scope.app_preview_required(reviewed + [unknown]))

    def test_review_only_v12_renderer_cannot_create_media_preview_exception(self):
        approved = [
            "scripts/ops/anevum_metal_shader.py",
            "scripts/ops/render_anevum_armillary_v12.py",
            "tests/test_anevum_metal_shader.py",
        ]
        self.assertTrue(all(path in scope.ISOLATED_PUBLIC_STUDIO_PATHS for path in approved))
        self.assertFalse(scope.app_preview_required(approved))
        self.assertTrue(scope.public_studio_required(approved))
        # Never generalize the exception to arbitrary media, scripts or private apps.
        for forbidden in [
            "apps/anevum-public-studio/review/assets/hero-v12.mp4",
            "apps/anevum-public-studio/review/assets/hero-v12.webm",
            "scripts/ops/publish-anevum-media.py",
            "src/App.tsx",
        ]:
            with self.subTest(path=forbidden):
                self.assertTrue(scope.app_preview_required(approved + [forbidden]))

    def test_original_research_motion_renderer_is_isolated_but_unknown_media_fails_closed(self):
        approved = "scripts/ops/render-anevum-research-motion.py"
        self.assertIn(approved, scope.ISOLATED_PUBLIC_STUDIO_PATHS)
        self.assertFalse(scope.app_preview_required([approved]))
        self.assertTrue(scope.public_studio_required([approved]))
        self.assertTrue(scope.app_preview_required([
            approved, "apps/anevum-public-studio/review/assets/research.mp4"
        ]))
        self.assertTrue(scope.app_preview_required([
            approved, "scripts/ops/unreviewed-media-publisher.py"
        ]))

    def test_unknown_new_public_studio_file_cannot_bypass_preview(self):
        files = ["apps/anevum-public-studio/worker.mjs", "apps/anevum-public-studio/auth.mjs"]
        self.assertTrue(scope.app_preview_required(files))
        self.assertTrue(scope.public_studio_required(files))

    def test_maintenance_only_does_not_start_public_studio_build(self):
        self.assertFalse(scope.public_studio_required(["README.md"]))
        self.assertFalse(scope.public_studio_required([]))

    def test_empty_input_cannot_skip_preview(self):
        self.assertTrue(scope.app_preview_required([]))

if __name__=='__main__':
    unittest.main()
