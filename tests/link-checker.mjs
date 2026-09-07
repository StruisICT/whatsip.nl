/**
 * Link checker
 * Verify all internal links resolve to a built file (flat structure).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const BASE_URL = process.env.TEST_URL || "https://whatsip.nl";

const PAGES = [
  "index.html", "ipv6.html", "browser.html", "headers.html", "webrtc.html",
  "storage.html", "geolocation.html", "permissions.html", "api.html",
  "about.html", "privacy.html",
];

// Edge-function paths that have no file in dist/ — never treat as broken.
const FUNCTION_PATHS = ["/ip", "/api/"];

let errors = 0;

function extractLinks(html) {
  const links = [];
  const hrefRegex = /href="([^"]+)"/g;
  const srcRegex = /src="([^"]+)"/g;

  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    links.push({ type: "href", url: match[1] });
  }
  while ((match = srcRegex.exec(html)) !== null) {
    links.push({ type: "src", url: match[1] });
  }

  return links;
}

function isInternal(url) {
  return url.startsWith("/") || url.startsWith(BASE_URL);
}

function resolveInternalPath(url) {
  // Strip origin, cache-busting query, and fragment.
  const cleanUrl = url.replace(BASE_URL, "").replace(/[?#].*$/, "");

  if (cleanUrl === "/" || cleanUrl === "") return path.join(DIST, "index.html");

  if (cleanUrl.startsWith("/")) {
    // Edge functions have no static file — skip.
    if (FUNCTION_PATHS.some((p) => cleanUrl === p || cleanUrl.startsWith(p))) return null;
    const rel = cleanUrl.substring(1);
    // A path with an extension is a static asset; otherwise it's a page → <slug>.html
    return path.join(DIST, rel.includes(".") ? rel : `${rel}.html`);
  }

  return null;
}

console.log("Checking links...\n");

for (const page of PAGES) {
  const filePath = path.join(DIST, page);
  const html = fs.readFileSync(filePath, "utf8");
  const links = extractLinks(html);

  for (const link of links) {
    // Skip special protocols
    if (link.url.startsWith("mailto:") ||
        link.url.startsWith("tel:") ||
        link.url.startsWith("#") ||
        link.url.startsWith("about:") ||
        link.url.startsWith("data:")) {
      continue;
    }

    if (isInternal(link.url)) {
      const targetPath = resolveInternalPath(link.url);
      if (targetPath && !fs.existsSync(targetPath)) {
        console.error(`✗ /${page}: broken internal link "${link.url}" (${link.type})`);
        errors++;
      }
    }
    // External links: just check they're HTTPS (full check is slow)
    else if (link.url.startsWith("http://") && !link.url.includes("localhost")) {
      console.warn(`⚠ /${page}: insecure external link "${link.url}"`);
    }
  }
}

console.log(`${errors === 0 ? "✓" : "✗"} Link check: ${errors === 0 ? "PASSED" : `${errors} broken links`}`);
process.exit(errors > 0 ? 1 : 0);
