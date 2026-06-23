/**
 * Build validation tests
 * Verify all expected pages are generated, assets exist, no broken references
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

const LANGS = ["en", "nl"];
const PAGES = ["index.html", "browser.html", "headers.html", "webrtc.html", "ipv6.html", "privacy.html"];
const ASSETS = ["style.css", "app.js", "i18n.js", "ads.txt", "robots.txt", "sitemap.xml", "_headers", "_redirects"];

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

// Test 2: All language directories exist
LANGS.forEach(lang => {
  test(`Language directory /${lang}/ exists`, () => {
    fileExists(path.join(DIST, lang));
  });
});

// Test 3: All pages exist for each language
LANGS.forEach(lang => {
  PAGES.forEach(page => {
    test(`Page /${lang}/${page} exists`, () => {
      fileExists(path.join(DIST, lang, page));
    });
  });
});

// Test 4: All shared assets exist
ASSETS.forEach(asset => {
  test(`Asset /${asset} exists`, () => {
    fileExists(path.join(DIST, asset));
  });
});

// Test 5: Pages have minimum content
LANGS.forEach(lang => {
  test(`/${lang}/index.html has content`, () => {
    const content = fs.readFileSync(path.join(DIST, lang, "index.html"), "utf8");
    if (content.length < 1000) throw new Error("Page too small");
    if (!content.includes("<!doctype html")) throw new Error("Missing doctype");
    if (!content.includes(`<html lang="${lang}"`)) throw new Error(`Wrong lang attribute`);
  });
});

// Test 6: Sitemap contains all URLs
test("sitemap.xml contains all pages", () => {
  const sitemap = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
  const expectedCount = LANGS.length * (PAGES.length);
  const urlCount = (sitemap.match(/<loc>/g) || []).length;
  if (urlCount !== expectedCount) {
    throw new Error(`Expected ${expectedCount} URLs, found ${urlCount}`);
  }
});

// Test 7: robots.txt points to sitemap
test("robots.txt references sitemap", () => {
  const robots = fs.readFileSync(path.join(DIST, "robots.txt"), "utf8");
  if (!robots.includes("Sitemap:")) throw new Error("No sitemap reference");
});

// Test 8: AdSense script in pages
test("AdSense script present in pages", () => {
  const content = fs.readFileSync(path.join(DIST, "en", "index.html"), "utf8");
  if (!content.includes("pagead2.googlesyndication.com")) {
    throw new Error("AdSense script missing");
  }
});

// Test 9: CSS file is not empty
test("style.css has content", () => {
  const css = fs.readFileSync(path.join(DIST, "style.css"), "utf8");
  if (css.length < 1000) throw new Error("CSS file too small");
});

// Test 10: i18n.js generated
test("i18n.js contains translations", () => {
  const i18n = fs.readFileSync(path.join(DIST, "i18n.js"), "utf8");
  if (!i18n.includes("window.t")) throw new Error("Missing t() function");
  if (!i18n.includes('"en"') || !i18n.includes('"nl"')) {
    throw new Error("Missing language keys");
  }
  if (!i18n.includes("What is my IP") || !i18n.includes("Wat is mijn IP")) {
    throw new Error("Missing translations");
  }
});

console.log(`\n${errors === 0 ? "✓" : "✗"} Build validation: ${errors === 0 ? "PASSED" : `FAILED (${errors} errors)`}`);
process.exit(errors > 0 ? 1 : 0);
