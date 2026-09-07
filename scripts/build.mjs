// Static site generator for whatsip.nl.
// Reads src/strings.json (single source of NL/EN copy) + src/pages/*.{html,js}
// and emits a FLAT static site to dist/:  dist/*.html at root paths (no /en//nl/
// dirs, no language router) + shared assets + a generated /i18n.js (full NL/EN
// dictionary + client-side language toggle) + sitemap.
//
// Text is baked in a default language (BAKE); every {{t:key}} becomes a
// <span data-i18n="key"> so /i18n.js can swap the whole page to the other
// language in-place (no reload). This keeps the URL structure flat and
// redirect-free; Google indexes the baked language per URL.
//
// No dependencies. Run: node scripts/build.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const ORIGIN = "https://whatsip.nl";
const LANGS = ["en", "nl"];
const BAKE = "en"; // language baked into the HTML (indexed by search engines)
const BUILD_VERSION = Date.now();

const STR = JSON.parse(fs.readFileSync(path.join(SRC, "strings.json"), "utf8"));

// Pages: slug "" is the home page. `nav` = appears in the top tab bar.
const PAGES = [
  { slug: "", out: "index.html", title: "title.home", desc: "desc.home", frag: "home", script: "home", nav: "nav.myip" },
  { slug: "ipv6", out: "ipv6.html", title: "title.ipv6", desc: "desc.ipv6", frag: "ipv6", script: "ipv6", nav: "nav.ipv6" },
  { slug: "browser", out: "browser.html", title: "title.browser", desc: "desc.browser", frag: "browser", script: "browser", nav: "nav.browser" },
  { slug: "headers", out: "headers.html", title: "title.headers", desc: "desc.headers", frag: "headers", script: "headers", nav: "nav.headers" },
  { slug: "webrtc", out: "webrtc.html", title: "title.webrtc", desc: "desc.webrtc", frag: "webrtc", script: "webrtc", nav: "nav.webrtc" },
  { slug: "storage", out: "storage.html", title: "storage.title", desc: "storage.intro", frag: "storage", script: "storage", nav: "nav.storage" },
  { slug: "geolocation", out: "geolocation.html", title: "geo.title", desc: "geo.intro", frag: "geolocation", script: "geolocation", nav: "nav.geo" },
  { slug: "permissions", out: "permissions.html", title: "perm.title", desc: "perm.intro", frag: "permissions", script: "permissions", nav: "nav.perm" },
  { slug: "api", out: "api.html", title: "api.title", desc: "api.intro", frag: "api", script: null, nav: null },
  { slug: "about", out: "about.html", title: "about.title", desc: "about.intro", frag: "about", script: null, nav: null },
  { slug: "privacy", out: "privacy.html", title: "title.privacy", desc: "desc.privacy", frag: "privacy", script: null, nav: null },
];
const NAV = PAGES.filter((p) => p.nav);

const read = (p) => fs.readFileSync(path.join(SRC, p), "utf8");
const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
// Flat path for a slug: "" -> "/", "ipv6" -> "/ipv6".
const pathFor = (slug) => "/" + slug;

function head(page) {
  const S = STR[BAKE];
  const url = `${ORIGIN}${pathFor(page.slug)}`;
  return `<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>${S[page.title]}</title>
  <meta name="description" content="${attr(S[page.desc])}" />
  <link rel="canonical" href="${url}" />
  <meta name="theme-color" content="#0b0f14" media="(prefers-color-scheme: dark)" />
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${attr(S[page.title])}" />
  <meta property="og:description" content="${attr(S[page.desc])}" />
  <meta property="og:image" content="${ORIGIN}/favicon.svg" />
  <meta property="og:site_name" content="whatsip.nl" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:url" content="${url}" />
  <meta name="twitter:title" content="${attr(S[page.title])}" />
  <meta name="twitter:description" content="${attr(S[page.desc])}" />
  <script>try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="stylesheet" href="/style.css?v=${BUILD_VERSION}" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "whatsip.nl - IP Address Checker",
    "url": "${ORIGIN}",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "description": "${attr(S[page.desc])}",
    "offers": {"@type": "Offer", "price": "0"},
    "inLanguage": ["en", "nl"]
  }
  </script>
  <script defer src="/i18n.js?v=${BUILD_VERSION}"></script>
  <script defer src="/app.js?v=${BUILD_VERSION}"></script>
</head>`;
}

// Wrap a translatable label so /i18n.js can swap it in place.
const T = (key) => `<span data-i18n="${key}">${STR[BAKE][key]}</span>`;

function nav(slug) {
  const S = STR[BAKE];
  const tabs = NAV.map((it) => {
    const cur = it.slug === slug ? ' aria-current="page"' : "";
    return `<a href="${pathFor(it.slug)}"${cur}>${T(it.nav)}</a>`;
  }).join("\n      ");
  return `<header class="nav">
    <a class="brand" href="/">whatsip<span>.nl</span></a>
    <nav class="tabs" aria-label="Tools">
      ${tabs}
    </nav>
    <button class="theme-btn" id="lang" type="button" data-i18n-aria="aria.lang" aria-label="${attr(S["aria.lang"])}">NL</button>
    <button class="theme-btn" id="theme" type="button" data-i18n-aria="aria.theme" aria-label="${attr(S["aria.theme"])}">🌓</button>
  </header>`;
}

function footer(slug) {
  const noteKey = slug === "" ? "footer.privacyNote" : "footer.note";
  return `<footer><span>${T(noteKey)}</span> &nbsp;·&nbsp; <a href="/api">${T("footer.api")}</a> &nbsp;·&nbsp; <a href="/about">${T("footer.about")}</a> &nbsp;·&nbsp; <a href="/privacy">${T("footer.privacy")}</a><br /><span class="copyright">© <a href="https://struisict.com" rel="noopener">Struisict.com</a></span></footer>`;
}

function renderPage(page) {
  const S = STR[BAKE];
  let frag = read(`pages/${page.frag}.html`)
    .replace(/\{\{base\}\}/g, `/`)
    .replace(/\{\{t:([^}]+)\}\}/g, (_, k) => (k in S ? `<span data-i18n="${k}">${S[k]}</span>` : `«${k}»`));
  let scriptTag = "";
  if (page.script) {
    scriptTag = `\n  <script>\n${read(`pages/${page.script}.js`)}  </script>`;
  }
  return `<!doctype html>
<html lang="${BAKE}" data-i18n-title="${page.title}" data-i18n-desc="${page.desc}">
${head(page)}
<body>
  ${nav(page.slug)}
  ${frag.trim()}
  ${footer(page.slug)}${scriptTag}
</body>
</html>
`;
}

// Single client bundle: the full dictionary + t()/getLang() for JS-rendered
// labels + an in-place language swap driven by [data-i18n]/[data-i18n-aria]
// hooks, the #lang toggle, and <title>/meta description. No page reload.
function clientI18n() {
  return `(function(){
  var DICT = ${JSON.stringify(STR)};
  var DEFAULT = ${JSON.stringify(BAKE)};
  function pref(){
    try{ var s = localStorage.getItem("lang"); if(s==="en"||s==="nl") return s; }catch(e){}
    return (navigator.language||navigator.userLanguage||"").toLowerCase().indexOf("nl")===0 ? "nl" : "en";
  }
  var lang = pref();
  function tr(k){ var d = DICT[lang] || DICT[DEFAULT]; return d[k]!=null ? d[k] : k; }
  window.getLang = function(){ return lang; };
  window.t = function(k){ return tr(k); };
  // Page scripts register a re-render callback here so JS-generated content
  // (tool grids, statuses, the IP fields) re-translates on a language toggle.
  var langListeners = [];
  window.onWhatsipLang = function(fn){ if (typeof fn === "function") langListeners.push(fn); };
  function notify(){ for (var i=0;i<langListeners.length;i++){ try { langListeners[i](lang); } catch(e){} } }
  function apply(){
    var html = document.documentElement;
    html.setAttribute("lang", lang);
    var els = document.querySelectorAll("[data-i18n]");
    for (var i=0;i<els.length;i++){ var v = tr(els[i].getAttribute("data-i18n")); if(v!=null) els[i].innerHTML = v; }
    var ar = document.querySelectorAll("[data-i18n-aria]");
    for (var j=0;j<ar.length;j++){ ar[j].setAttribute("aria-label", tr(ar[j].getAttribute("data-i18n-aria"))); }
    var tk = html.getAttribute("data-i18n-title"); if(tk) document.title = tr(tk);
    var dk = html.getAttribute("data-i18n-desc"); if(dk){ var m = document.querySelector('meta[name="description"]'); if(m) m.setAttribute("content", tr(dk)); }
    var lb = document.getElementById("lang"); if(lb) lb.textContent = (lang==="nl" ? "EN" : "NL");
  }
  function wire(){
    var lb = document.getElementById("lang");
    if(!lb) return;
    lb.textContent = (lang==="nl" ? "EN" : "NL");
    lb.addEventListener("click", function(){
      lang = (lang==="nl" ? "en" : "nl");
      try{ localStorage.setItem("lang", lang); }catch(e){}
      apply();
      notify();
    });
  }
  function init(){ if(lang!==DEFAULT) apply(); wire(); }
  if(document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
`;
}

// Guarantee every language defines exactly the same keys, so the swap never
// misses a label.
function assertStringParity() {
  const ref = Object.keys(STR.en).sort();
  for (const lang of LANGS) {
    if (lang === "en") continue;
    const keys = Object.keys(STR[lang]).sort();
    const missing = ref.filter((k) => !(k in STR[lang]));
    const extra = keys.filter((k) => !(k in STR.en));
    if (missing.length || extra.length) {
      console.error(`❌ i18n parity error for "${lang}":`);
      if (missing.length) console.error(`   missing: ${missing.join(", ")}`);
      if (extra.length) console.error(`   extra:   ${extra.join(", ")}`);
      process.exit(1);
    }
  }
}

function sitemap() {
  const lastmod = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const urls = PAGES.map(
    (p) => `  <url><loc>${ORIGIN}${pathFor(p.slug)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${p.slug === "" ? "1.0" : "0.8"}</priority></url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

// ---- pre-build validation ----
import { execSync } from "node:child_process";

function validateJavaScript() {
  const jsFiles = fs.readdirSync(path.join(SRC, "pages"))
    .filter((f) => f.endsWith(".js"))
    .map((f) => path.join(SRC, "pages", f));

  for (const file of jsFiles) {
    try {
      execSync(`node --check "${file}"`, { encoding: "utf8", stdio: "pipe" });
    } catch (err) {
      console.error(`\n❌ JavaScript syntax error in ${path.basename(file)}:\n`);
      console.error(err.stderr || err.message);
      process.exit(1);
    }
  }
}

validateJavaScript();
assertStringParity();

// ---- build ----
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
for (const page of PAGES) {
  fs.writeFileSync(path.join(DIST, page.out), renderPage(page));
}
fs.writeFileSync(path.join(DIST, "i18n.js"), clientI18n());
fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemap());

// Copy shared static assets verbatim.
for (const f of fs.readdirSync(path.join(SRC, "static"))) {
  fs.copyFileSync(path.join(SRC, "static", f), path.join(DIST, f));
}

console.log(`Built ${PAGES.length} pages -> dist/ (flat) + i18n.js, sitemap.xml, static assets.`);
