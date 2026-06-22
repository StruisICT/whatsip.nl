# Plan: localized URLs (NL/EN) for SEO

## Why change the current approach

Today i18n is **client-side**: one HTML per page, text swapped by `i18n.js`. That's
great for users but weak for SEO — Google indexes **one** version per URL, so the
site can only really rank in one language. To rank in **both Dutch and English**,
each language needs its **own indexable URL** with proper `hreflang` annotations.

Goal: keep the site tiny and fast, but give each language real URLs and let Google
serve the right one per searcher.

## URL structure (decision: subdirectories, symmetric)

```
/                    → 302 to /nl/ or /en/ by Accept-Language (language router)
/en/                 My IP            (English, content baked into the HTML)
/en/browser  /en/headers  /en/webrtc  /en/ipv6
/nl/                 Mijn IP          (Dutch)
/nl/browser  /nl/headers  /nl/webrtc  /nl/ipv6
/ip  /api/*          shared, language-agnostic Functions (unchanged)
/style.css /app.js /i18n.js /ads.txt   shared static (unchanged, cached once)
/privacy  → /en/privacy, /nl/privacy
```

- **Subdirectories** (`/en/`, `/nl/`) — Google's recommended pattern; no extra DNS,
  one Pages project, simplest hreflang. (Subdomains/ccTLD rejected: more infra, the
  `.nl` ccTLD already nudges Dutch.)
- **Symmetric** (both languages prefixed) avoids root↔/nl/ duplicate-content; the
  root path holds no content, it only routes.

## hreflang + canonical (per page)

Each localized page carries, in `<head>`:

```html
<link rel="canonical"  href="https://whatsip.nl/en/browser" />
<link rel="alternate" hreflang="en" href="https://whatsip.nl/en/browser" />
<link rel="alternate" hreflang="nl" href="https://whatsip.nl/nl/browser" />
<link rel="alternate" hreflang="x-default" href="https://whatsip.nl/en/browser" />
```

- Canonical = the page's own localized URL (self-referential).
- Reciprocal `hreflang` between the two language versions (required by Google).
- `x-default` = English (international fallback).

## Root language router (`/`)

A Pages Function `functions/index.ts` reads `Accept-Language` and **302**s to `/nl/`
(if it starts with `nl`) else `/en/`. No content at `/`.

- **No cookie** (keeps our zero-cookie promise): routing uses `Accept-Language`
  only. A user's explicit toggle changes the URL directly and is remembered in
  `localStorage` for client niceties — the server router stays cookieless.
- Crawlers: Google follows the 302 and uses `hreflang` to pick versions; the
  `x-default` covers the root.
- The catch-all "unknown URL → main page" (`_redirects`) now points at `/`, which
  the router then sends to the right language.

## Repo restructure + build step

The site becomes **template + data → generated static**, so we never hand-maintain
two copies. No runtime cost (build-time only; bandwidth unchanged).

```
src/
  strings.json        # { "en": {...}, "nl": {...} }  (today's i18n dictionary)
  pages/
    index.html        # one template per page, with {{key}} placeholders
    browser.html  headers.html  webrtc.html  ipv6.html  privacy.html
  partials/
    head.html  nav.html  footer.html        # shared chrome with {{lang}} links
  static/             # style.css, app.js, i18n.js, ads.txt, _headers, _redirects
scripts/
  build.mjs           # Node, zero deps
functions/            # unchanged (ip.ts, api/*)
dist/                 # build output → Cloudflare Pages serves this
```

`scripts/build.mjs` (no dependencies):
1. For each `lang ∈ {en, nl}` and each page template:
   - substitute `{{key}}` from `strings.json[lang]`,
   - set `<html lang>`, localized `<title>` + `meta description`,
   - inject canonical + 3× hreflang,
   - rewrite nav/footer links to `/{{lang}}/...`,
   - write `dist/{lang}/{page}.html`.
2. Copy `src/static/*` → `dist/`.
3. Generate `dist/sitemap.xml` (every URL with its `hreflang` alternates) and
   `dist/robots.txt` (points at the sitemap).

The language toggle button becomes a **link to the sibling URL** (e.g. `/nl/browser`
↔ `/en/browser`), set per page at build time — no reload-and-swap.

`i18n.js` shrinks to just `window.t(key)` for the **JS-rendered values** (IP fields,
browser fields), picking the language from `document.documentElement.lang` (baked).
It no longer detects or swaps static text.

## Cloudflare Pages config changes

- Build command: `node scripts/build.mjs`
- Build output directory: `dist`
- Functions dir: `functions/` (unchanged)
- Local dev: `npm run build && npx wrangler pages dev dist`

## Sitemap / robots

- `sitemap.xml` with `<xhtml:link rel="alternate" hreflang="…">` per URL (both langs).
- `robots.txt`: `Sitemap: https://whatsip.nl/sitemap.xml`.

## Migration phases

1. **Scaffold build**: move current pages into `src/pages` templates + `src/strings.json`;
   write `build.mjs`; output English to `dist/en` and Dutch to `dist/nl`.
2. **Router + redirects**: `functions/index.ts` Accept-Language 302; update `_redirects`.
3. **hreflang + sitemap + robots**: emit alternates and the sitemap.
4. **Switch Pages**: build command `node scripts/build.mjs`, output `dist`; verify
   `/en/…`, `/nl/…`, root redirect, and `curl` checks still pass.
5. **Submit**: Google Search Console — sitemap + confirm hreflang has no errors.

## Open decisions (confirm before building)

- [ ] Subdirectories `/en/ /nl/` (recommended) — OK?
- [ ] `x-default` = English (vs Dutch, given the `.nl` domain)?
- [ ] Cookieless root routing via `Accept-Language` only — OK (keeps zero-cookie)?
- [ ] Accept the **build step** (`dist/`, `src/` restructure) — OK?
- [ ] Move `privacy.html` under `/en/ /nl/` too, or keep one bilingual page?
