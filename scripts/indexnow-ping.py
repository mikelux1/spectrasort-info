#!/usr/bin/env python3
"""Notify IndexNow (Bing, Yandex, Seznam, Naver) that URLs changed.

Why this exists: bing/organic sent 2 sessions in 11 weeks while ChatGPT sent 239,
and ChatGPT's search layer leans on Bing's index. Pinging IndexNow after a deploy
gets changed URLs re-crawled in hours instead of waiting for a natural crawl.

Usage:
    python3 scripts/indexnow-ping.py                  # every URL in sitemap.xml
    python3 scripts/indexnow-ping.py --changed-since 2026-09-16
    python3 scripts/indexnow-ping.py https://spectrasort.app/pricing/ ...

The key file lives at the repo root as <key>.txt and must stay published; the
API rejects the submission if it cannot fetch it.
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

HOST = "spectrasort.app"
ROOT = Path(__file__).resolve().parent.parent
ENDPOINT = "https://api.indexnow.org/IndexNow"


def find_key() -> str:
    keys = [p for p in ROOT.glob("*.txt") if re.fullmatch(r"[0-9a-f]{32}", p.stem)]
    if not keys:
        sys.exit("No IndexNow key file (<32-hex>.txt) at the repo root.")
    if len(keys) > 1:
        sys.exit(f"Multiple key files found: {[k.name for k in keys]}")
    return keys[0].stem


def sitemap_urls(changed_since: str | None) -> list[str]:
    xml = (ROOT / "sitemap.xml").read_text()
    pairs = re.findall(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", xml)
    if changed_since:
        return [u for u, mod in pairs if mod >= changed_since]
    return [u for u, _ in pairs]


def main() -> None:
    args = sys.argv[1:]
    if "--changed-since" in args:
        i = args.index("--changed-since")
        urls = sitemap_urls(args[i + 1])
        del args[i:i + 2]
    elif args:
        urls = args
    else:
        urls = sitemap_urls(None)

    if not urls:
        sys.exit("Nothing to submit.")

    key = find_key()
    payload = json.dumps({
        "host": HOST,
        "key": key,
        "keyLocation": f"https://{HOST}/{key}.txt",
        "urlList": urls,
    }).encode()

    req = urllib.request.Request(
        ENDPOINT, data=payload,
        headers={"Content-Type": "application/json; charset=utf-8"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        status = resp.status
    print(f"IndexNow HTTP {status} for {len(urls)} URL(s)")
    for u in urls:
        print("  ", u)
    if status not in (200, 202):
        sys.exit(f"Unexpected status {status}")


if __name__ == "__main__":
    main()
