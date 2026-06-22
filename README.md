# whatsip.nl

A tiny, very fast **what's-my-IP** site. Edge-served on Cloudflare Pages, no
framework, privacy-first (no cookies, no trackers).

See [`PLAN.md`](./PLAN.md) for the architecture, pipeline, and cost analysis.

## Status

Built. Static site + edge functions + AdSense wired in. Pending Cloudflare Pages
connection and the real AdSense slot ID.

## Layout

Bilingual (NL/EN) static site generated from `src/` into `dist/`.

- `src/strings.json` — single source of all NL/EN copy.
- `src/pages/*.html` + `*.js` — per-page content fragment + its script.
- `src/static/*` — shared assets (`style.css`, `app.js`, `ads.txt`, `_headers`, `_redirects`, `robots.txt`).
- `scripts/build.mjs` — generator → `dist/en/*`, `dist/nl/*`, `i18n.js`, `sitemap.xml`.
- `functions/index.ts` — `/` → `Accept-Language` 302 to `/nl/` or `/en/`.
- `functions/api/info.ts` — edge JSON `{ ip, asn, org, country, ... }`.
- `functions/api/headers.ts` — edge JSON of request headers (cookies redacted).
- `functions/ip.ts` — plain-text IP (`curl whatsip.nl/ip`).

Live URLs: `/en/  /en/browser  /en/headers  /en/webrtc  /en/ipv6  /en/privacy`
(and the `/nl/` equivalents). See [`docs/localized-urls.md`](docs/localized-urls.md).

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
