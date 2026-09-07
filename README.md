# whatsip.nl

A tiny, very fast **what's-my-IP** site. Edge-served on Cloudflare Pages, no
framework, privacy-first (no cookies, no trackers, no ads).

See [`PLAN.md`](./PLAN.md) for the architecture, pipeline, and cost analysis.
Want to host your own copy? The [wiki](https://github.com/StruisICT/whatsip.nl/wiki) explains how everything works, including a [self-hosting guide](https://github.com/StruisICT/whatsip.nl/wiki/Self-Hosting).

## Status

Live at https://whatsip.nl (Cloudflare Pages, auto-deploy from `main`).
Ad-free: AdSense was removed entirely in July 2026. See [`LAUNCH.md`](./LAUNCH.md).

## Layout

Bilingual (NL/EN) static site generated from `src/` into `dist/`. Pages are served
at **flat paths** with **no redirects**; the language is switched **client-side**
(a `#lang` toggle + `navigator.language` auto-detect), so each page has one URL.

- `src/strings.json` — single source of all NL/EN copy.
- `src/pages/*.html` + `*.js` — per-page content fragment + its script.
- `src/static/*` — shared assets (`style.css`, `app.js`, `sw.js`, `_headers`, `_redirects`, `robots.txt`).
- `scripts/build.mjs` — generator → flat `dist/*.html` (text baked in English, every
  `{{t:key}}` wrapped as `<span data-i18n>`), one `dist/i18n.js` (full NL/EN dictionary
  + in-place language swap), and `sitemap.xml`.
- `functions/api/info.ts` — edge JSON `{ ip, asn, org, country, ... }`.
- `functions/api/headers.ts` — edge JSON of request headers (cookies redacted).
- `functions/ip.ts` — plain-text IP (`curl whatsip.nl/ip`).

Live URLs: `/  /ipv6  /browser  /headers  /webrtc  /storage  /geolocation  /permissions  /api  /about  /privacy`.
Legacy `/en/*` and `/nl/*` URLs 301 to their flat path. See [`docs/localized-urls.md`](docs/localized-urls.md).

## Deploy

Cloudflare Pages via Git integration (push to `main` → production, PR → preview).
Full runbook: [`CLOUDFLARE.md`](./CLOUDFLARE.md).

## Develop

```bash
npm install
npm run build      # generate dist/
npm run dev        # build + wrangler pages dev dist (local edge runtime)
npm run typecheck
```
