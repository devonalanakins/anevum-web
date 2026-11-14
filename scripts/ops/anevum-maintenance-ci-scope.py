#!/usr/bin/env python3
"""Decide whether this maintenance-only PR changes application runtime inputs."""
import re
import subprocess
import sys

MAINTENANCE_PATHS = frozenset([
    # Repository overview text is not served or bundled into the web app.
    "README.md",
    ".github/workflows/anevum-ops-progression-reset-20261021.yml",
    ".github/workflows/anevum-verify.yml",
    "docs/ANEVUM.OPS.MAINT.2026-10-21.002.MANUAL-RESET-RUNBOOK.md",
    "scripts/ops/anevum-progression-reset-20261021.py",
    "scripts/ops/anevum-maintenance-ci-scope.py",
    "tests/test_anevum_progression_reset_20261021.py",
    "tests/test_anevum_maintenance_ci_scope.py",
    "tests/helpers/retired-production-contract.mjs",
    "tests/single-production-deploy.test.mjs",
    "tests/v5-verify-deploy-safety.test.mjs",
    "tests/command-trading.test.mjs",
    "tests/v5-owner-member-binding.test.mjs",
    "tests/v5-preview-encrypted-backup.test.mjs",
    "tests/v5-production-manual-deploy.test.mjs",
    "tests/v5-production-release.test.mjs",
    # These two files implement and test a read-only, always-on CI contract
    # checker. They are not application or hosted-preview inputs. The workflow
    # must still run the verifier unconditionally and fail closed on mismatch.
    "scripts/verify-v5-cross-repo-schema.mjs",
    "tests/v5-cross-repo-schema.test.mjs",
    # Reviewed repository-extraction tooling and standalone project metadata.
    # These do not alter the ANEVUM web runtime, build or deployments.
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
    "tests/repository-split.test.mjs",
])

# Separate Access-protected reviewer files never deploy the legacy apex.
# They require their own independent build/browser gate rather than the
# old anevum-web-nextgen remote-preview Access configuration.
ISOLATED_ORIGINAL_WORKS_REVIEW_PATHS = frozenset([
    "scripts/ops/build-original-works-review.sh",
    "scripts/ops/local-original-works-review-server.mjs",
    "scripts/ops/original-works-review-worker.mjs",
    "scripts/ops/verify-original-works-review-browser.sh",
    "tests/original-works-review-worker.test.mjs",
    "wrangler.original-works-review.jsonc",
])

# The static public shell has no legacy V5 runtime or private publishing path.
# Its own browser/security gate is mandatory for these exact files only.
ISOLATED_PUBLIC_STUDIO_PATHS = frozenset([
    "apps/anevum-public-studio/worker.mjs",
    # Exact review-only cinematic source and its mandatory review checks.
    "apps/anevum-public-studio/review/cinematic-laboratory.html",
    "apps/anevum-public-studio/review/assets/hero.webp",
    "apps/anevum-public-studio/review/assets/hero-mobile.webp",
    "apps/anevum-public-studio/review/assets/experiments.webp",
    "apps/anevum-public-studio/review/assets/research.webp",
    "apps/anevum-public-studio/review/assets/experiences.webp",
    "apps/anevum-public-studio/review/assets/archive.webp",
    "docs/design/ANEVUM.WEB.DESIGN.2026-11-13.002.CINEMATIC-LABORATORY-PRODUCTION.md",
    "tests/anevum-cinematic-review.test.mjs",
    # Review-only V17 local media bridge and negative-path tests (no binary media).
    "scripts/ops/anevum-cinematic-local-preview.mjs",
    "tests/anevum-cinematic-local-preview.test.mjs",
    "scripts/ops/verify-anevum-cinematic-http-browser.mjs",
    # Offline original animation renderer; never deployed or bundled by the public Worker.
    "scripts/ops/render-anevum-research-motion.py",
    # Original, offline-only V12 material/3D footage pipeline and tests.
    # No output media, deploy operation, Worker route, or token access.
    "scripts/ops/anevum_metal_shader.py",
    "scripts/ops/render_anevum_armillary_v12.py",
    "tests/test_anevum_metal_shader.py",
    "apps/anevum-public-studio/living-laboratory-home.mjs",
    "apps/anevum-public-studio/living-laboratory-experiments.mjs",
    "apps/anevum-public-studio/living-laboratory-research.mjs",
    "apps/anevum-public-studio/living-laboratory-archive.mjs",
    "apps/anevum-public-studio/living-laboratory-art.mjs",
    "apps/anevum-public-studio/art/lab-hero-v1.webp",
    "apps/anevum-public-studio/art/rhen-generative-v1.webp",
    "apps/anevum-public-studio/art/brandle-interactive-v1.webp",
    "apps/anevum-public-studio/art/original-worlds-v1.webp",
    "apps/anevum-public-studio/art/research-generation-v1.webp",
    "apps/anevum-public-studio/art/research-computation-v1.webp",
    "apps/anevum-public-studio/art/research-worlds-v1.webp",
    "apps/anevum-public-studio/art/research-imagination-v1.webp",
    "apps/anevum-public-studio/art/lab-archive-v1.webp",
    "tests/anevum-public-studio.test.mjs",
    "scripts/ops/anevum-public-studio-test-server.mjs",
    "scripts/ops/verify-anevum-public-studio-browser.mjs",
    "wrangler.anevum-public-studio.jsonc",
    "docs/design/ANEVUM.WEB.BUILD.2026-11-03.022.PUBLIC-ORIGINAL-WORKS-SHELL.md",
    "docs/design/ANEVUM.WEB.OPS.2026-11-03.027.CANONICAL-ORIGINAL-WORKS-LAUNCH.md",
])

def public_studio_required(paths):
    return bool(paths) and any(path in ISOLATED_PUBLIC_STUDIO_PATHS for path in paths)

def isolated_review_required(paths):
    return bool(paths) and any(path in ISOLATED_ORIGINAL_WORKS_REVIEW_PATHS for path in paths)

def app_preview_required(paths):
    # Unknown or mixed application changes still require legacy preview safety.
    # Isolated review files use a separate mandatory review acceptance gate.
    return not paths or any(path not in MAINTENANCE_PATHS | ISOLATED_ORIGINAL_WORKS_REVIEW_PATHS | ISOLATED_PUBLIC_STUDIO_PATHS for path in paths)

def main():
    if len(sys.argv) != 3 or not all(re.fullmatch(r'[a-f0-9]{40}', s) for s in sys.argv[1:]):
        raise SystemExit('Two exact Git commit SHAs required')
    raw = subprocess.check_output(['git', 'diff', '--name-only', '-z', sys.argv[1]+'...'+sys.argv[2]])
    paths = [p.decode('utf-8', errors='strict') for p in raw.split(b'\0') if p]
    print('app_preview_required=' + str(app_preview_required(paths)).lower())
    print('isolated_review_required=' + str(isolated_review_required(paths)).lower())
    print('public_studio_required=' + str(public_studio_required(paths)).lower())

if __name__ == '__main__':
    main()
