#!/usr/bin/env python3
"""IndexNow: tell Bing which pages changed in this deploy.

Runs by itself on GitHub after every push to main (the job is in
.github/workflows/indexnow.yml). Nobody has to remember to run it, and it
works the same whoever deploys.

Rules
- Only pages listed in sitemap.xml / sitemap-info.xml are ever sent.
- A page is sent only when its content really changed. A new ?v= cache
  number on its own does not count.
- It waits until the changed page is live before telling Bing.
- It never fails a deploy: any problem is printed as a warning.

Send every page by hand:
  GitHub > Actions > "Tell Bing about changed pages" > Run workflow
See what a deploy would send, without sending:
  DRY_RUN=1 BEFORE=<older commit> python .github/scripts/indexnow.py
"""
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request

HOST = "exploresoman.com"
# Not a secret. IndexNow keys are public: the matching file sits at the site root.
KEY = "fab0798075d6b9e292b1f9246595d897"
BASE = "https://%s/" % HOST
KEY_FILE = KEY + ".txt"
KEY_URL = BASE + KEY_FILE
SITEMAPS = ("sitemap.xml", "sitemap-info.xml")
ENDPOINT = "https://api.indexnow.org/indexnow"
ZERO = "0" * 40
WAIT_MINUTES = 8


def say(msg):
    print(msg, flush=True)


def warn(msg):
    say("::warning::IndexNow: " + msg)


def sitemap_urls():
    urls = []
    for name in SITEMAPS:
        if not os.path.exists(name):
            continue
        with open(name, encoding="utf-8") as f:
            for u in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", f.read()):
                if u.startswith(BASE) and u not in urls:
                    urls.append(u)
    return urls


def path_of(url):
    p = url[len(BASE):]
    if p == "" or p.endswith("/"):
        p += "index.html"
    return p


def norm(data):
    # The ?v=NNN cache number changes on every deploy. That is not new content.
    return re.sub(rb"([?&]v=)\d+", rb"\1", data)


def git(*args):
    return subprocess.run(("git",) + args, capture_output=True)


def commit_exists(commit):
    return git("cat-file", "-e", commit + "^{commit}").returncode == 0


def touched_paths(before):
    r = git("diff", "--name-only", "-z", before, "HEAD")
    if r.returncode != 0:
        return None
    return set(p for p in r.stdout.decode("utf-8", "replace").split("\0") if p)


def really_changed(before, url):
    path = path_of(url)
    if not os.path.exists(path):
        return False
    with open(path, "rb") as f:
        new = f.read()
    old = git("show", "%s:%s" % (before, path))
    if old.returncode != 0:
        return True  # the page is new
    return norm(old.stdout) != norm(new)


def is_live(url, path):
    with open(path, "rb") as f:
        want = f.read()
    # a throwaway query string steps around the CDN's cached copy
    probe = "%s?indexnow-check=%d" % (url, int(time.time()))
    req = urllib.request.Request(probe, headers={"User-Agent": "exploresoman-indexnow"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.read() == want
    except Exception:
        return False


def wait_until_live(url, path, minutes):
    deadline = time.time() + minutes * 60
    while True:
        if is_live(url, path):
            return True
        if time.time() >= deadline:
            return False
        time.sleep(10)


def send(urls):
    body = json.dumps({
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_URL,
        "urlList": urls,
    }).encode("utf-8")
    req = urllib.request.Request(ENDPOINT, data=body, method="POST", headers={
        "Content-Type": "application/json; charset=utf-8",
        "User-Agent": "exploresoman-indexnow",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read(300).decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read(300).decode("utf-8", "replace")


def pages_to_send():
    urls = sitemap_urls()
    if not urls:
        warn("no pages found in the sitemaps, nothing sent")
        return []
    if os.environ.get("EVENT") == "workflow_dispatch":
        say("Manual run: sending every page in the sitemaps.")
        return [u for u in urls if os.path.exists(path_of(u))]

    before = (os.environ.get("BEFORE") or "").strip()
    if not before or before == ZERO or not commit_exists(before):
        before = "HEAD~1"
        if not commit_exists(before):
            say("No earlier deploy to compare with. Nothing sent.")
            return []
    touched = touched_paths(before)
    if touched is None:
        warn("could not compare with the previous deploy, nothing sent")
        return []
    candidates = [u for u in urls if path_of(u) in touched]
    say("%d sitemap pages, %d touched by this deploy." % (len(urls), len(candidates)))
    return [u for u in candidates if really_changed(before, u)]


def main():
    todo = pages_to_send()
    if not todo:
        say("No page content changed. Nothing to tell Bing.")
        return
    say("%d page(s) to send:" % len(todo))
    for u in todo:
        say("  " + u)

    if os.environ.get("DRY_RUN") == "1":
        say("DRY RUN: nothing was sent.")
        return

    if not os.path.exists(KEY_FILE):
        warn("the key file %s is missing from the site, nothing sent" % KEY_FILE)
        return
    if not wait_until_live(KEY_URL, KEY_FILE, WAIT_MINUTES):
        warn("the key file is not live at %s, nothing sent" % KEY_URL)
        return
    first = todo[0]
    if not wait_until_live(first, path_of(first), WAIT_MINUTES):
        warn("the new version of %s was not live after %d minutes, sending anyway" % (first, WAIT_MINUTES))

    status, text = send(todo)
    if status in (200, 202):
        say("::notice::IndexNow accepted %d page(s) (HTTP %d)." % (len(todo), status))
    else:
        warn("HTTP %d from IndexNow. %s" % (status, text.strip()[:200]))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # never let this break a deploy
        warn("stopped on an error: %r" % (e,))
    sys.exit(0)
