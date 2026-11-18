# ANEVUM learning identity — staging-only backend vertical slice
Session: ANEVUM.WEB.BUILD.2026-11-18.002.CONFLUENCE-AND-PRIVATE-LEARNER-INTEGRATION
Owning PR: #816
Status: SOURCE IMPLEMENTED; authentication, database provision and remote persistence NOT DEPLOYED OR VERIFIED

## Security and architecture
- Keep the existing ANEVUM Better Auth Google member session. No second auth system, separate member cookie, public user lookup, or Command/finance privileges.
- New authenticated route: GET/PUT/DELETE `/api/member/learning/profile`. The existing `memberEndpoint` verifies configuration, authorized HTTPS origin, Better Auth session, and same-origin mutations **before** routing. The new endpoint independently rechecks preview origin, expected member identity header, request shape and database.
- Hard gate: `ANEVUM_LEARNING_PROFILE_PREVIEW_ENABLED=true` **AND** `ANEVUM_MEMBER_PREVIEW_ENABLED=true` **AND** configured preview HTTPS origin. Explicitly disallowed on `https://anevum.com`; no flag was enabled in committed config.
- Schema `migrations-learning-preview/0001_private_learner_profile.sql` must be applied manually to a separately provisioned staging MEMBER_DB after backup and owner authorization. It is intentionally NOT an automatically applied production migration.
- Only `user_id` from verified Better Auth session selects rows, with parameterized SQL and FK cascade on account deletion. No member-supplied user ID, public visibility, awards, roles or clinical data.
- Versioned `anevum-local-member-card/v1` content rules are reused for server validation. PUT requires `{expectedRevision,profile}`, exact keys, max 2 KiB streaming JSON, and concurrency-safe compare-and-swap updates (insert-if-absent, revision-bound update). DELETE removes only the account's private learning card.
- No cross-device UI sync or credential issuance is claimed. The existing browser-local Studio is still the verified user-facing path.

## Required before a live member profile
1. Verify staging worker origin, exact Better Auth session, database binding and latest migrations; do not change production secrets, Google provider, DNS, or protected routes.
2. Run 2-account staging tests, same-origin CSRF cases, stale revision races, data export and deletion, 320/390px UI, and backups/restores. Record evidence.
3. Implement authenticated Studio client sync with explicit local-to-account migration confirmation, privacy UI, session loss, export and deletion; do not silently upload local notes/research.
4. Add separate adult-account policy, abuse prevention and publication moderation before public community profiles or any awards.
5. Obtain owner approval before production data migrations, auth switches, public release or new staff access.
