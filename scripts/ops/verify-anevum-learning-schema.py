#!/usr/bin/env python3
"""SQLite-compatible offline test for the ANEVUM private learner staging schema.

Only an in-memory synthetic database is used. This does not provision D1,
authenticate a human, migrate production or verify Cloudflare deployment.
"""
from __future__ import annotations

import pathlib
import sqlite3

ROOT = pathlib.Path(__file__).resolve().parents[2]
SCHEMA = ROOT / "migrations-learning-preview" / "0001_private_learner_profile.sql"


def expect_constraint(connection: sqlite3.Connection, statement: str, params: tuple) -> None:
    try:
        connection.execute(statement, params)
    except sqlite3.IntegrityError:
        return
    raise AssertionError("Expected SQLite constraint rejection")


def main() -> None:
    connection = sqlite3.connect(":memory:")
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute('CREATE TABLE "user" (id TEXT PRIMARY KEY NOT NULL)')
    connection.executemany('INSERT INTO "user" (id) VALUES (?)', [("member-A",), ("member-B",)])
    connection.executescript(SCHEMA.read_text(encoding="utf-8"))

    for member in ("member-A", "member-B"):
        connection.execute(
            "INSERT INTO member_learning_profiles "
            "(user_id, revision, display_name, tagline, interests_json) VALUES (?,?,?,?,?)",
            (member, 1, "Researcher " + member[-1], "Documenting models", '["Physics"]'),
        )
    connection.commit()
    a = connection.execute(
        "SELECT display_name, revision FROM member_learning_profiles WHERE user_id=?",
        ("member-A",),
    ).fetchone()
    b = connection.execute(
        "SELECT display_name, revision FROM member_learning_profiles WHERE user_id=?",
        ("member-B",),
    ).fetchone()
    assert a == ("Researcher A", 1) and b == ("Researcher B", 1)
    assert connection.execute(
        "UPDATE member_learning_profiles SET revision=revision+1,display_name='Updated' "
        "WHERE user_id=? AND revision=?",
        ("member-A", 0),
    ).rowcount == 0, "Stale revision must not write"
    assert connection.execute(
        "UPDATE member_learning_profiles SET revision=revision+1,display_name='Updated' "
        "WHERE user_id=? AND revision=?",
        ("member-A", 1),
    ).rowcount == 1
    assert connection.execute(
        "SELECT revision FROM member_learning_profiles WHERE user_id='member-A'"
    ).fetchone()[0] == 2
    expect_constraint(
        connection,
        "INSERT INTO member_learning_profiles (user_id,display_name) VALUES (?,?)",
        ("member-A", "Duplicate"),
    )
    expect_constraint(
        connection,
        "INSERT INTO member_learning_profiles (user_id,display_name) VALUES (?,?)",
        ("nonexistent-user", "Forged owner"),
    )
    expect_constraint(
        connection,
        "UPDATE member_learning_profiles SET interests_json=? WHERE user_id=?",
        ('{"not":"array"}', "member-B"),
    )
    expect_constraint(
        connection,
        "UPDATE member_learning_profiles SET display_name=? WHERE user_id=?",
        ("X", "member-B"),
    )
    connection.execute('DELETE FROM "user" WHERE id=?', ("member-A",))
    assert connection.execute(
        "SELECT COUNT(*) FROM member_learning_profiles WHERE user_id='member-A'"
    ).fetchone()[0] == 0, "Account deletion must cascade to private learner data"
    assert connection.execute(
        "SELECT display_name FROM member_learning_profiles WHERE user_id='member-B'"
    ).fetchone()[0] == "Researcher B", "Other member must be unaffected"
    assert connection.execute("PRAGMA foreign_key_check").fetchall() == []
    print(
        "ANEVUM_LEARNING_SQLITE_REHEARSAL_PASS",
        {"synthetic_members": 2, "revision_conflict_guard": True,
         "isolation": True, "cascade": True, "foreign_keys_clear": True,
         "production_migration": False},
    )
    connection.close()


if __name__ == "__main__":
    main()
