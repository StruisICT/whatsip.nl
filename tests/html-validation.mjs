/**
 * HTML validation tests
 * Validate all generated HTML pages against HTML5 standards
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HtmlValidate } from "html-validate";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

const htmlvalidate = new HtmlValidate({
  extends: ["html-validate:recommended"],
  rules: {
    // Allow custom data attributes for i18n
    "no-unknown-elements": "off",
    // We use inline styles for theme initialization
    "no-inline-style": "off",
    // Codebase style: XHTML-ish self-closing void tags and lowercase doctype
    // (both valid HTML5)
    "void-style": ["error", { style: "selfclosing" }],
    "doctype-style": "off",
  },
});

const LANGS = ["en", "nl"];
const PAGES = ["index.html", "browser.html", "headers.html", "webrtc.html", "ipv6.html", "privacy.html"];

let totalErrors = 0;
let totalWarnings = 0;

console.log("Validating HTML files...\n");

for (const lang of LANGS) {
  for (const page of PAGES) {
    const filePath = path.join(DIST, lang, page);
    const report = await htmlvalidate.validateFile(filePath);

    if (!report.valid) {
      console.log(`✗ /${lang}/${page}:`);
      const messages = report.results[0]?.messages || [];
      for (const msg of messages) {
        if (msg.severity === 2) {
          console.log(`  ERROR: ${msg.message} (line ${msg.line}:${msg.column})`);
          totalErrors++;
        } else {
          console.log(`  WARN: ${msg.message} (line ${msg.line}:${msg.column})`);
          totalWarnings++;
        }
      }
    } else {
      console.log(`✓ /${lang}/${page}`);
    }
  }
}

console.log(`\n${totalErrors === 0 ? "✓" : "✗"} HTML validation: ${totalErrors} errors, ${totalWarnings} warnings`);
process.exit(totalErrors > 0 ? 1 : 0);
