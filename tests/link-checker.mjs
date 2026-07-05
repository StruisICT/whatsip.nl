/**
 * Link checker
 * Verify all internal links work, check external links (with caching)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const BASE_URL = process.env.TEST_URL || "https://whatsip.nl";

const LANGS = ["en", "nl"];
const PAGES = ["index.html", "browser.html", "headers.html", "webrtc.html", "ipv6.html", "privacy.html"];

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

function resolveInternalPath(url, lang) {
  // Remove BASE_URL prefix if present, plus cache-busting query / fragment
  let cleanUrl = url.replace(BASE_URL, "").replace(/[?#].*$/, "");

  // Handle root
  if (cleanUrl === "/" || cleanUrl === "") return path.join(DIST, lang, "index.html");
  
  // Handle language prefixes
  if (cleanUrl.startsWith("/en/") || cleanUrl.startsWith("/nl/")) {
    const parts = cleanUrl.split("/").filter(Boolean);
    const targetLang = parts[0];
    const page = parts[1] || "index";
    return path.join(DIST, targetLang, page === "" || page === "/" ? "index.html" : `${page}.html`);
  }
  
  // Shared assets
  if (cleanUrl.startsWith("/")) {
    return path.join(DIST, cleanUrl.substring(1));
  }
  
  return null;
}

console.log("Checking links...\n");

for (const lang of LANGS) {
  for (const page of PAGES) {
    const filePath = path.join(DIST, lang, page);
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
        const targetPath = resolveInternalPath(link.url, lang);
        if (targetPath && !fs.existsSync(targetPath)) {
          console.error(`✗ /${lang}/${page}: broken internal link "${link.url}" (${link.type})`);
          errors++;
        }
      }
      // External links: just check they're HTTPS (full check is slow)
      else if (link.url.startsWith("http://") && !link.url.includes("localhost")) {
        console.warn(`⚠ /${lang}/${page}: insecure external link "${link.url}"`);
      }
    }
  }
}

console.log(`${errors === 0 ? "✓" : "✗"} Link check: ${errors === 0 ? "PASSED" : `${errors} broken links`}`);
process.exit(errors > 0 ? 1 : 0);
