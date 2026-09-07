/**
 * Build validation tests
 * Verify all expected pages are generated, assets exist, no broken references
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

// Flat structure: one HTML per page at the dist root (no /en//nl/ dirs).
const PAGES = [
  "index.html", "ipv6.html", "browser.html", "headers.html", "webrtc.html",
  "storage.html", "geolocation.html", "permissions.html", "api.html",
  "about.html", "privacy.html",
];
const ASSETS = ["style.css", "app.js", "i18n.js", "robots.txt", "sitemap.xml", "_headers", "_redirects"];

let errors = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}: ${err.message}`);
    errors++;
  }
}

function fileExists(p) {
  if (!fs.existsSync(p)) throw new Error(`Missing: ${p}`);
}

// Test 1: dist/ exists
test("dist/ directory exists", () => {
  if (!fs.existsSync(DIST)) throw new Error("dist/ not found");
});

// Test 2: All pages exist at the flat root
PAGES.forEach(page => {
  test(`Page /${page} exists`, () => {
    fileExists(path.join(DIST, page));
  });
});

// Test 3: No legacy language directories remain
test("no /en or /nl directories", () => {
  for (const lang of ["en", "nl"]) {
    if (fs.existsSync(path.join(DIST, lang))) throw new Error(`Unexpected /${lang}/ directory`);
  }
});

// Test 4: All shared assets exist
ASSETS.forEach(asset => {
  test(`Asset /${asset} exists`, () => {
    fileExists(path.join(DIST, asset));
  });
});

// Test 5: Home page has content and the baked language attribute
test("index.html has content", () => {
  const content = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
  if (content.length < 1000) throw new Error("Page too small");
  if (!content.includes("<!doctype html")) throw new Error("Missing doctype");
  if (!content.includes(`<html lang="en"`)) throw new Error("Wrong/ missing lang attribute");
});

// Test 6: Sitemap contains one URL per built page
test("sitemap.xml contains all pages", () => {
  const sitemap = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
  const builtPages = fs.readdirSync(DIST).filter((f) => f.endsWith(".html")).length;
  const urlCount = (sitemap.match(/<loc>/g) || []).length;
  if (urlCount !== builtPages) {
    throw new Error(`Expected ${builtPages} URLs, found ${urlCount}`);
  }
});

// Test 7: robots.txt points to sitemap
test("robots.txt references sitemap", () => {
  const robots = fs.readFileSync(path.join(DIST, "robots.txt"), "utf8");
  if (!robots.includes("Sitemap:")) throw new Error("No sitemap reference");
});

// Test 8: no ad scripts in pages
test("no ad scripts in pages", () => {
  const content = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
  if (content.includes("googlesyndication.com") || content.includes("adsbygoogle")) {
    throw new Error("Unexpected ad script found");
  }
});

// Test 9: CSS file is not empty
test("style.css has content", () => {
  const css = fs.readFileSync(path.join(DIST, "style.css"), "utf8");
  if (css.length < 1000) throw new Error("CSS file too small");
});

// Test 10: single i18n bundle carries both languages + t()
test("i18n bundle contains both languages", () => {
  const js = fs.readFileSync(path.join(DIST, "i18n.js"), "utf8");
  if (!js.includes("window.t")) throw new Error("Missing t() function");
  if (!js.includes("What is my IP")) throw new Error("Missing EN translations");
  if (!js.includes("Wat is mijn IP")) throw new Error("Missing NL translations");
});

console.log(`\n${errors === 0 ? "✓" : "✗"} Build validation: ${errors === 0 ? "PASSED" : `FAILED (${errors} errors)`}`);
process.exit(errors > 0 ? 1 : 0);
