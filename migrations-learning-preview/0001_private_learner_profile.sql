-- ANEVUM Open Institute: PRIVATE learner profile review schema.
-- This file is intentionally outside the production migrations/ directory.
-- DO NOT apply to production or a shared database without separate owner approval.
-- For a separately provisioned ANEVUM member staging database, apply manually
-- after backup/restore verification and an authorized migration review.
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS member_learning_profiles (
  user_id TEXT PRIMARY KEY NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  revision INTEGER NOT NULL DEFAULT 1 CHECK(revision BETWEEN 1 AND 1000001),
  display_name TEXT NOT NULL CHECK(length(display_name) BETWEEN 2 AND 60),
  tagline TEXT NOT NULL DEFAULT '' CHECK(length(tagline)<=180),
  interests_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(interests_json) AND json_type(interests_json)='array'),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- No public visibility, achievements, grade, role, science claim or cross-tenant selector.
