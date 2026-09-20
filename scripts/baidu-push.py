#!/usr/bin/env python3
"""Push URLs to Baidu 普通收录 (主动推送) so they skip the natural crawl queue.

Companion to indexnow-ping.py, which covers Bing/Yandex/Seznam/Naver. Baidu
runs its own thing and needs its own call.

    https://ziyuan.baidu.com/linksubmit/index   (where the token lives)

WHY THIS MATTERS FOR US: an offshore site with no ICP filing gets a thin
natural crawl budget from Baidu — 30-45 days to first index is the normal
figure. Active push bypasses the schedule and is the single biggest lever an
overseas site has. It is also the only Baidu surface that reports back
honestly: a push that returns success but never indexes tells you the fetch
itself is failing.

PREREQUISITE, AND IT IS A HARD ONE: pushing only queues a crawl. Baiduspider
still has to fetch the URL. While spectrasort.app is served from GitHub Pages
origin, that fetch returns 403 (GitHub blocks Baiduspider by User-Agent) and
every push is wasted. Fix the origin first — see
photomatcher/5-cn/baidu-indexing-runbook.md. Run --check to see where we are.

Setup:
    export BAIDU_PUSH_TOKEN=...        # 站长平台 → 普通收录 → API 提交
    export BAIDU_PUSH_SITE=spectrasort.app   # optional, this is the default

Usage:
    python3 scripts/baidu-push.py                    # the zh pages (default)
    python3 scripts/baidu-push.py --all              # every sitemap URL
    python3 scripts/baidu-push.py https://... ...    # specific URLs
    python3 scripts/baidu-push.py --check            # can Baiduspider fetch us?
"""
import os
import re
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SITE = "spectrasort.app"

# Baidu documents this endpoint as plain HTTP; it does not serve the push API
# over TLS. The token is low-value (it only lets someone submit our own URLs
# for indexing) but do not reuse it anywhere else.
ENDPOINT = "http://data.zz.baidu.com/urls"

BAIDUSPIDER_UA = ("Mozilla/5.0 (compatible; Baiduspider/2.0; "
                  "+http://www.baidu.com/search/spider.html)")


def sitemap_urls(zh_only: bool) -> list[str]:
    name = "sitemap-zh.xml" if zh_only else "sitemap.xml"
    xml = (ROOT / name).read_text()
    return re.findall(r"<loc>([^<]+)</loc>", xml)


def check_fetchable(url: str) -> int | None:
    """Request a URL as Baiduspider. 403 means the origin block is still live."""
    req = urllib.request.Request(url, headers={"User-Agent": BAIDUSPIDER_UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception as e:
        print(f"  request failed: {e}")
        return None


def run_check() -> None:
    print(f"Fetching as Baiduspider — {BAIDUSPIDER_UA}\n")
    bad = 0
    for url in sitemap_urls(zh_only=True):
        status = check_fetchable(url)
        verdict = {200: "OK", 403: "BLOCKED (origin still refuses Baiduspider)"}
        label = verdict.get(status, f"unexpected {status}")
        if status != 200:
            bad += 1
        print(f"  {str(status):>4}  {label:<44}  {url}")
    print()
    if bad:
        print(f"{bad} of the zh URLs are not fetchable by Baiduspider.")
        print("Pushing now would burn quota on URLs Baidu cannot crawl.")
        print("Fix the origin first: 5-cn/baidu-indexing-runbook.md")
        sys.exit(1)
    print("All zh URLs fetchable as Baiduspider — safe to push.")


def push(urls: list[str], site: str, token: str) -> None:
    # Baidu caps a single call at 2000 URLs; we are nowhere near that, but
    # chunk anyway so this does not become a surprise later.
    for i in range(0, len(urls), 2000):
        chunk = urls[i:i + 2000]
        req = urllib.request.Request(
            f"{ENDPOINT}?site={site}&token={token}",
            data="\n".join(chunk).encode(),
            headers={"Content-Type": "text/plain"})
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            sys.exit(f"Baidu returned HTTP {e.code}: {e.read().decode()[:400]}")

        if "error" in body:
            sys.exit(f"Baidu rejected the push: {body}")
        print(f"Pushed {body.get('success', '?')} of {len(chunk)} URL(s); "
              f"{body.get('remain', '?')} left in today's quota")
        for u in body.get("not_same_site", []):
            print(f"  REJECTED (not the verified site): {u}")
        for u in body.get("not_valid", []):
            print(f"  REJECTED (malformed): {u}")
        for u in chunk:
            print("  ", u)


def main() -> None:
    args = sys.argv[1:]

    if "--check" in args:
        run_check()
        return

    zh_only = "--all" not in args
    explicit = [a for a in args if a.startswith("http")]
    urls = explicit or sitemap_urls(zh_only)
    if not urls:
        sys.exit("Nothing to submit.")

    token = os.environ.get("BAIDU_PUSH_TOKEN")
    if not token:
        sys.exit("BAIDU_PUSH_TOKEN is not set. Get it from "
                 "https://ziyuan.baidu.com/linksubmit/index (普通收录 → API 提交). "
                 "Run --check first if you have not confirmed the origin fix.")
    site = os.environ.get("BAIDU_PUSH_SITE", DEFAULT_SITE)

    push(urls, site, token)


if __name__ == "__main__":
    main()
