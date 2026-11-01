"""Smoke tests for aboutu.

Serves the repository with Python's http.server, then drives it with
Playwright (Chromium). Covers three things:

  1. the demo page (index.html)
  2. the editor (form build, live preview, ZIP export)
  3. the exported site (extract the ZIP, serve it, and render it)

Usage:
    python tests/run.py

Requires:
    pip install playwright && python -m playwright install chromium
"""

import functools
import http.server
import json
import socket
import socketserver
import sys
import tempfile
import threading
import zipfile
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Playwright is required. Run: pip install playwright && python -m playwright install chromium")
    sys.exit(2)

ROOT = Path(__file__).resolve().parent.parent

_FAILURES = []


def Check(Label, Condition, Detail=""):
    Mark = "PASS" if Condition else "FAIL"
    Line = f"  [{Mark}] {Label}"
    if Detail and not Condition:
        Line += f"  -> {Detail}"
    print(Line)
    if not Condition:
        _FAILURES.append(Label)
    return Condition


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *Args):
        pass


class QuietServer(socketserver.ThreadingTCPServer):
    daemon_threads = True
    allow_reuse_address = True

    def handle_error(self, Request, ClientAddress):
        if isinstance(sys.exc_info()[1], (ConnectionError, BrokenPipeError)):
            return
        super().handle_error(Request, ClientAddress)


def Serve(Directory):
    Handler = functools.partial(QuietHandler, directory=str(Directory))
    Server = QuietServer(("127.0.0.1", 0), Handler)
    Port = Server.server_address[1]
    Thread = threading.Thread(target=Server.serve_forever, daemon=True)
    Thread.start()
    return Server, Port


def Collector(Page):
    Errors = []
    Failed = []
    Page.on("console", lambda M: Errors.append(f"{M.type}: {M.text}") if M.type == "error" else None)
    Page.on("pageerror", lambda E: Errors.append(f"pageerror: {E}"))
    Page.on("response", lambda R: Failed.append(f"{R.status} {R.url}") if R.status >= 400 else None)
    return Errors, Failed


def TestDemo(Browser, Base):
    print("\nDemo page")
    Ctx = Browser.new_context(viewport={"width": 1200, "height": 800})
    Page = Ctx.new_page()
    Errors, Failed = Collector(Page)
    Resp = Page.goto(Base + "/index.html", wait_until="networkidle")
    Check("demo responds 200", Resp.status == 200, str(Resp.status))
    Page.wait_for_timeout(600)
    Entry = Page.locator(".pf-entry")
    if Entry.count():
        Entry.click()
        Page.wait_for_timeout(1000)
    Check("name rendered", Page.locator(".pf-name-text").count() >= 1)
    Check("links rendered", Page.locator(".pf-link").count() >= 1, str(Page.locator(".pf-link").count()))
    Check("badges rendered", Page.locator(".pf-badge").count() >= 1, str(Page.locator(".pf-badge").count()))
    Check("badge icons are inline svg", Page.locator(".pf-badge .pf-badge-icon").count() >= 1)
    Check("verified badge styled as regular badge", Page.locator(".pf-badge.pf-badge-verified").count() >= 1)
    Check("views show eye icon", Page.locator(".pf-views .pf-views-icon").count() >= 1)
    Check("location shows pin icon", Page.locator(".pf-location .pf-location-icon").count() >= 1)
    Check("controls rendered", Page.locator(".pf-controls").count() >= 1)
    CanvasSize = Page.evaluate(
        """() => {
            const C = document.querySelector('.pf-canvas-particles');
            return C ? [C.width, C.height] : null;
        }"""
    )
    Check("particle canvas is sized (not 0x0)", CanvasSize is not None and CanvasSize[0] > 0 and CanvasSize[1] > 0, str(CanvasSize))
    Check("no failed requests", not Failed, "; ".join(Failed[:5]))
    Check("no console errors", not Errors, "; ".join(Errors[:5]))
    Ctx.close()


def TestEditor(Browser, Base):
    print("\nEditor")
    Ctx = Browser.new_context(viewport={"width": 1500, "height": 900}, accept_downloads=True)
    Page = Ctx.new_page()
    Errors, Failed = Collector(Page)
    Page.goto(Base + "/editor/", wait_until="networkidle")
    Page.wait_for_timeout(1500)
    Check("form cards built", Page.locator(".card").count() >= 10, str(Page.locator(".card").count()))
    Check("nav built", Page.locator(".nav-btn").count() >= 10)
    Check("toggles present", Page.locator(".toggle").count() >= 5)

    Frame = Page.frame_locator("#preview-frame")
    Page.wait_for_timeout(1200)
    Check("preview mounts", Frame.locator(".pf-name-text").count() >= 1)

    Loc = Page.locator('.field:has(.field-label:text-is("Location")) input[type="text"]').first
    if Loc.count():
        Loc.fill("the open web")
        Page.wait_for_timeout(900)
        Check("live preview updates", Frame.locator(".pf-location").count() >= 1)

    Page.select_option("#preset-select", "nova")
    Page.wait_for_timeout(1200)
    Check("preview renders controls", Frame.locator(".pf-controls").count() >= 1)

    Page.locator(".nav-btn-label", has_text="Links").click()
    Page.wait_for_timeout(300)
    Page.locator(".btn-add").last.click()
    Page.wait_for_timeout(300)
    Check("add-link modal opens with blurred backdrop", Page.locator(".modal-backdrop").count() == 1)
    Check("add-link modal has no freeform icon field", Page.locator(".modal-body .icon-picker-custom").count() == 0)
    Page.keyboard.press("Escape")
    Page.wait_for_timeout(200)
    Check("modal closes on escape", Page.locator(".modal-backdrop").count() == 0)

    ZipPath = Path(tempfile.gettempdir()) / "aboutu-test-site.zip"
    with Page.expect_download(timeout=25000) as Dl:
        Page.click("#btn-export-zip")
    Dl.value.save_as(str(ZipPath))
    Check("export downloaded", ZipPath.exists() and ZipPath.stat().st_size > 0)

    Names = []
    if ZipPath.exists():
        with zipfile.ZipFile(ZipPath) as Z:
            Check("zip is valid", Z.testzip() is None)
            Names = Z.namelist()
    for Required in ["index.html", "js/config.js", "js/profile.js", "css/style.css"]:
        Check(f"zip contains {Required}", Required in Names)
    Check("zip bundles assets", any(N.startswith("assets/") for N in Names))

    Check("no failed requests", not Failed, "; ".join(Failed[:5]))
    Check("no console errors", not Errors, "; ".join(Errors[:5]))
    Ctx.close()
    return ZipPath if ZipPath.exists() else None


def TestExportedSite(Browser, ZipPath):
    print("\nExported site")
    if not ZipPath or not ZipPath.exists():
        Check("exported site renders", False, "no zip to test")
        return
    SiteDir = Path(tempfile.mkdtemp(prefix="aboutu-site-"))
    with zipfile.ZipFile(ZipPath) as Z:
        Z.extractall(SiteDir)

    Server, Port = Serve(SiteDir)
    try:
        Ctx = Browser.new_context(viewport={"width": 1200, "height": 800})
        Page = Ctx.new_page()
        Errors, Failed = Collector(Page)
        Resp = Page.goto(f"http://127.0.0.1:{Port}/index.html", wait_until="networkidle")
        Check("exported page responds 200", Resp.status == 200, str(Resp.status))
        Page.wait_for_timeout(600)
        Entry = Page.locator(".pf-entry")
        if Entry.count():
            Entry.click()
            Page.wait_for_timeout(1000)
        Check("exported name rendered", Page.locator(".pf-name-text").count() >= 1)
        Check("exported links rendered", Page.locator(".pf-link").count() >= 1)
        Check("exported controls rendered", Page.locator(".pf-controls").count() >= 1)
        Check("exported tab title matches display name", Page.title() == Page.locator(".pf-name-text").first.text_content())
        AvatarOk = Page.evaluate(
            """() => {
                const Img = document.querySelector('.pf-avatar img, img.pf-avatar');
                return Img ? (Img.complete && Img.naturalWidth > 0) : true;
            }"""
        )
        Check("exported avatar loads", AvatarOk is True)

        Check("no failed requests", not Failed, "; ".join(Failed[:5]))
        Check("no console errors", not Errors, "; ".join(Errors[:5]))
        Ctx.close()
    finally:
        Server.shutdown()


def Main():
    Server, Port = Serve(ROOT)
    Base = f"http://127.0.0.1:{Port}"
    print(f"Serving {ROOT} at {Base}")
    try:
        with sync_playwright() as P:
            Browser = P.chromium.launch()
            TestDemo(Browser, Base)
            ZipPath = TestEditor(Browser, Base)
            TestExportedSite(Browser, ZipPath)
            Browser.close()
    finally:
        Server.shutdown()

    print()
    if _FAILURES:
        print(f"{len(_FAILURES)} check(s) failed: {', '.join(_FAILURES)}")
        sys.exit(1)
    print("All checks passed.")


if __name__ == "__main__":
    Main()
