#!/usr/bin/env python3
"""Build a portable, media-separated ANEVUM V21 cinematic owner-review.

ANEVUM.WEB.FIX.2026-11-14.005.LIGHTWEIGHT-REVIEW-PACKAGING

The prior 5+ MB HTML previews embedded MP4/WebM and WebP as base64, which
made viewing sluggish and did not render inside some attachment viewers.
This tool extracts immutable local media files, keeps the real semantic UI,
and rewrites the preview media allowlist to local relative paths only.
It never publishes assets, changes the live Worker, or enables site media.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import re
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

STATUS = "REVIEW_ONLY_NOT_PRODUCTION_APPROVED"
DATA = re.compile(r"data:(image/webp|video/mp4|video/webm);base64,([A-Za-z0-9+/=]+)")
EXTENSIONS = {"image/webp": "webp", "video/mp4": "mp4", "video/webm": "webm"}
MAGIC = {
    "image/webp": lambda b: b[:4] == b"RIFF" and b[8:12] == b"WEBP",
    "video/mp4": lambda b: b[4:8] == b"ftyp",
    "video/webm": lambda b: b[:4] == bytes([0x1A, 0x45, 0xDF, 0xA3]),
}
LOCAL_VIDEO_CHECK = "if (!src || !/^\\.\\/media\\/[a-f0-9]{24}\\.(?:webm|mp4)$/.test(src)) continue;"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def build(source: Path, output: Path) -> dict:
    raw = source.read_bytes()
    if not (1000 < len(raw) <= 30 * 1024 * 1024):
        raise ValueError("Invalid input size")
    if output.exists() and any(output.iterdir()):
        raise FileExistsError("Refusing to overwrite an existing review")
    html = raw.decode("utf-8")
    if "<title>ANEVUM" not in html or html.count("data-scene=\"hero\"") != 1:
        raise ValueError("Not an ANEVUM owner review HTML")
    if html.count('data-video-ready="true"') != 2:
        raise ValueError("Expected exactly hero and Research review-enabled")
    for name in ["hero", "experiments", "research", "experiences", "archive"]:
        if html.count('data-scene="' + name + '"') != 1:
            raise ValueError("Missing or duplicate scene: " + name)
    if '<script src=' in html or '<iframe' in html:
        raise ValueError("External script/frame not permitted")

    # Delete a legacy embedded proof-of-concept MP4. Research is already supplied
    # by its real V21 media source, so the old sample adds no review value.
    html, sample_count = re.subn(
        r'<script id="review-sample-data" type="text/plain">[A-Za-z0-9+/=]+</script>\s*',
        "", html,
    )
    if sample_count != 1:
        raise ValueError("Missing/duplicate legacy sample script")
    html, sample_button = re.subn(
        r'<button type="button" id="review-sample"[^>]*>[^<]*</button>\s*', "", html
    )
    if sample_button != 1:
        raise ValueError("Missing/duplicate obsolete sample button")
    begin = "  document.querySelector('#review-sample').addEventListener('click',()=>{"
    end = "  picker.addEventListener('change'"
    if html.count(begin) != 1 or html.count(end) != 1:
        raise ValueError("Unexpected legacy sample event handler")
    a = html.index(begin)
    b = html.index(end, a)
    html = html[:a] + html[b:]

    # Replace the original base64/production media regex with a narrow local
    # allowlist. No HTTP(S), arbitrary paths, or unapproved file extensions.
    source_line = [line.strip() for line in html.splitlines()
                   if line.strip().startswith("if (!src || !/") and ".test(src)) continue;" in line]
    if len(source_line) != 1 or "data:video" not in source_line[0]:
        raise ValueError("Cannot verify original video allowlist")
    html = html.replace(source_line[0], LOCAL_VIDEO_CHECK)
    files: dict[str, bytes] = {}

    def externalize(match: re.Match[str]) -> str:
        mime, encoded = match.group(1), match.group(2)
        if len(encoded) > 15 * 1024 * 1024:
            raise ValueError("Oversize embedded media")
        data = base64.b64decode(encoded, validate=True)
        if not MAGIC[mime](data):
            raise ValueError("Invalid media header for " + mime)
        kind = "assets" if mime.startswith("image/") else "media"
        rel = f"{kind}/{sha(data)[:24]}.{EXTENSIONS[mime]}"
        if rel in files and files[rel] != data:
            raise ValueError("Digest collision")
        files[rel] = data
        return "./" + rel

    html, replaced = DATA.subn(externalize, html)
    if replaced != 12:
        raise ValueError("Expected exactly six WebP images and six video encodes")
    if len([name for name in files if name.endswith(".webp")]) != 6:
        raise ValueError("Expected six distinct image masters")
    if len([name for name in files if name.endswith((".mp4", ".webm"))]) != 6:
        raise ValueError("Expected six distinct videos")
    if "base64," in html or len(html.encode("utf-8")) > 180000:
        raise ValueError("Inline media remains in HTML")
    # Offline navigation should not incorrectly resolve to the computer's root.
    html = html.replace('href="/original-works/', 'href="https://anevum.com/original-works/')
    html = html.replace('href="/" aria-label="ANEVUM home"',
                        'href="https://anevum.com/" aria-label="ANEVUM home"')
    html = html.replace('<title>ANEVUM — V21 Research Motion Review</title>',
                        '<title>ANEVUM — V22 Lightweight Cinematic Review</title>')
    if LOCAL_VIDEO_CHECK not in html:
        raise ValueError("Local video gate not installed")

    # Validate before any writes; never mix staged/unverified assets with old work.
    manifest = {
        "status": STATUS, "session": "ANEVUM.WEB.FIX.2026-11-14.005.LIGHTWEIGHT-REVIEW-PACKAGING",
        "source_sha256": sha(raw), "owner_accepted": False, "rights_verified": False,
        "published": False, "media_format": "separate external files, local review only",
        "files": [{"path": name, "bytes": len(data), "sha256": sha(data)}
                  for name, data in sorted(files.items())],
    }
    output.mkdir(parents=True, exist_ok=True)
    for name, data in files.items():
        path = output / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    (output / "index.html").write_text(html, encoding="utf-8")
    (output / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    (output / "README.txt").write_text(
        "ANEVUM lightweight review (NOT LIVE / NOT APPROVED)\n\n"
        "Extract the entire ZIP first. On desktop, open index.html in Chrome or Safari.\n"
        "The MP4s in media/ can be opened directly; file viewers may display HTML as code.\n"
        "If local media restrictions apply, run 'python -m http.server 4179 --bind 127.0.0.1'\n"
        "from the extracted folder and open http://127.0.0.1:4179/ in your browser.\n"
        "Never publish this folder; footage and art remain review-only.\n", encoding="utf-8"
    )
    return manifest


def pack(output: Path, zipfile: Path) -> None:
    if zipfile.exists():
        raise FileExistsError("Refusing to replace existing ZIP")
    with ZipFile(zipfile, "w", compression=ZIP_DEFLATED, compresslevel=6) as archive:
        for item in sorted(output.rglob("*")):
            if item.is_file():
                archive.write(item, item.relative_to(output).as_posix())


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--zip", dest="zipfile", type=Path)
    args = parser.parse_args()
    manifest = build(args.source, args.output)
    if args.zipfile:
        pack(args.output, args.zipfile)
    print(json.dumps({"status": manifest["status"], "media_files": len(manifest["files"]),
                      "html_bytes": (args.output / "index.html").stat().st_size,
                      "zip": str(args.zipfile) if args.zipfile else None}))


if __name__ == "__main__":
    main()
