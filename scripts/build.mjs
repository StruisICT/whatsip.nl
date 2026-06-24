// Static site generator for whatsip.nl.
// Reads src/strings.json (single source of NL/EN copy) + src/pages/*.{html,js}
// and emits a localized static site to dist/:  dist/en/*, dist/nl/* + shared
// assets and a generated /i18n.js (client t() for JS-rendered labels) + sitemap.
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
const BUILD_VERSION = Date.now();

const STR = JSON.parse(fs.readFileSync(path.join(SRC, "strings.json"), "utf8"));

// Pages: slug "" is the home page. `nav` = appears in the top tab bar.
const PAGES = [
  { slug: "", out: "index.html", title: "title.home", desc: "desc.home", frag: "home", script: "home", nav: "nav.myip" },
  { slug: "browser", out: "browser.html", title: "title.browser", desc: "desc.browser", frag: "browser", script: "browser", nav: "nav.browser" },
  { slug: "headers", out: "headers.html", title: "title.headers", desc: "desc.headers", frag: "headers", script: "headers", nav: "nav.headers" },
  { slug: "webrtc", out: "webrtc.html", title: "title.webrtc", desc: "desc.webrtc", frag: "webrtc", script: "webrtc", nav: "nav.webrtc" },
  { slug: "ipv6", out: "ipv6.html", title: "title.ipv6", desc: "desc.ipv6", frag: "ipv6", script: "ipv6", nav: "nav.ipv6" },
  { slug: "dns", out: "dns.html", title: "title.dns", desc: "desc.dns", frag: "dns", script: "dns", nav: "nav.dns" },
  { slug: "storage", out: "storage.html", title: "storage.title", desc: "storage.intro", frag: "storage", script: "storage", nav: "nav.storage" },
  { slug: "geolocation", out: "geolocation.html", title: "geo.title", desc: "geo.intro", frag: "geolocation", script: "geolocation", nav: "nav.geo" },
  { slug: "privacy", out: "privacy.html", title: "title.privacy", desc: "desc.privacy", frag: "privacy", script: null, nav: null },
];
const NAV = PAGES.filter((p) => p.nav);

const read = (p) => fs.readFileSync(path.join(SRC, p), "utf8");
const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function head(lang, page) {
  const S = STR[lang];
  const url = (l) => `${ORIGIN}/${l}/${page.slug}`;
  return `<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>${S[page.title]}</title>
  <meta name="description" content="${attr(S[page.desc])}" />
  <link rel="canonical" href="${url(lang)}" />
  <link rel="alternate" hreflang="en" href="${url("en")}" />
  <link rel="alternate" hreflang="nl" href="${url("nl")}" />
  <link rel="alternate" hreflang="x-default" href="${url("en")}" />
  <meta name="theme-color" content="#0b0f14" media="(prefers-color-scheme: dark)" />
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url(lang)}" />
  <meta property="og:title" content="${attr(S[page.title])}" />
  <meta property="og:description" content="${attr(S[page.desc])}" />
  <meta property="og:image" content="${ORIGIN}/favicon.svg" />
  <meta property="og:site_name" content="whatsip.nl" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:url" content="${url(lang)}" />
  <meta name="twitter:title" content="${attr(S[page.title])}" />
  <meta name="twitter:description" content="${attr(S[page.desc])}" />
  <meta name="twitter:image" content="${ORIGIN}/favicon.svg" />
  <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin />
  <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
  <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />
  <script>try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1732510177342289" crossorigin="anonymous"></script>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="stylesheet" href="/style.css?v=${BUILD_VERSION}" />
  <script defer src="/i18n.js?v=${BUILD_VERSION}"></script>
  <script defer src="/app.js?v=${BUILD_VERSION}"></script>
</head>`;
}

function nav(lang, slug) {
  const S = STR[lang];
  const other = lang === "en" ? "nl" : "en";
  const tabs = NAV.map((it) => {
    const cur = it.slug === slug ? ' aria-current="page"' : "";
    return `<a href="/${lang}/${it.slug}"${cur}>${S[it.nav]}</a>`;
  }).join("\n      ");
  return `<header class="nav">
    <a class="brand" href="/${lang}/">whatsip<span>.nl</span></a>
    <nav class="tabs" aria-label="Tools">
      ${tabs}
    </nav>
    <a class="theme-btn" href="/${other}/${slug}" aria-label="${attr(S["aria.lang"])}">${other.toUpperCase()}</a>
    <button class="theme-btn" id="theme" type="button" aria-label="${attr(S["aria.theme"])}">🌓</button>
  </header>`;
}

function footer(lang, slug) {
  const S = STR[lang];
  const note = slug === "" ? S["footer.privacyNote"] : S["footer.note"];
  return `<footer><span>${note}</span> &nbsp;·&nbsp; <a href="/${lang}/privacy">${S["footer.privacy"]}</a></footer>`;
}

function renderPage(lang, page) {
  const S = STR[lang];
  let frag = read(`pages/${page.frag}.html`)
    .replace(/\{\{base\}\}/g, `/${lang}/`)
    .replace(/\{\{t:([^}]+)\}\}/g, (_, k) => (k in S ? S[k] : `«${k}»`));
  let scriptTag = "";
  if (page.script) {
    scriptTag = `\n  <script>\n${read(`pages/${page.script}.js`)}  </script>`;
  }
  return `<!doctype html>
<html lang="${lang}">
${head(lang, page)}
<body>
  ${nav(lang, page.slug)}
  ${frag.trim()}
  ${footer(lang, page.slug)}${scriptTag}
</body>
</html>
`;
}

function clientI18n() {
  return `(function(){
  var T = ${JSON.stringify(STR)};
  var lang = document.documentElement.getAttribute("lang") || "en";
  if (!T[lang]) lang = "en";
  window.getLang = function(){ return lang; };
  window.t = function(k){ return (T[lang] && T[lang][k]) || T.en[k] || k; };
})();
`;
}

function sitemap() {
  const alts = (slug) =>
    LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${ORIGIN}/${l}/${slug}"/>`).join("") +
    `<xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}/en/${slug}"/>`;
  const urls = PAGES.flatMap((p) =>
    LANGS.map((l) => `  <url><loc>${ORIGIN}/${l}/${p.slug}</loc>${alts(p.slug)}</url>`),
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

// ---- pre-build validation ----
import { execSync } from "node:child_process";

function validateJavaScript() {
  const jsFiles = fs.readdirSync(path.join(SRC, "pages"))
    .filter(f => f.endsWith(".js"))
    .map(f => path.join(SRC, "pages", f));
  
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

// ---- build ----
fs.rmSync(DIST, { recursive: true, force: true });
for (const lang of LANGS) {
  fs.mkdirSync(path.join(DIST, lang), { recursive: true });
  for (const page of PAGES) {
    fs.writeFileSync(path.join(DIST, lang, page.out), renderPage(lang, page));
  }
}
fs.writeFileSync(path.join(DIST, "i18n.js"), clientI18n());
fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemap());

// Copy shared static assets verbatim.
for (const f of fs.readdirSync(path.join(SRC, "static"))) {
  fs.copyFileSync(path.join(SRC, "static", f), path.join(DIST, f));
}

const pages = PAGES.length * LANGS.length;
console.log(`Built ${pages} pages -> dist/ (en, nl) + i18n.js, sitemap.xml, static assets.`);
