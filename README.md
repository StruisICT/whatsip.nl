# whatsip.nl

A tiny, very fast **what's-my-IP** site. Edge-served on Cloudflare Pages, no
framework, privacy-first (no cookies, no trackers).

See [`PLAN.md`](./PLAN.md) for the architecture, pipeline, and cost analysis.

## Status

Built. Static site + edge functions + AdSense wired in. Pending Cloudflare Pages
connection and the real AdSense slot ID.

## Layout

- `public/index.html` — the page (static, CDN, AAA contrast, dark/light).
- `public/privacy.html` — privacy policy (AdSense disclosure).
- `public/ads.txt` — AdSense authorisation.
- `public/_headers` — security + caching headers (AdSense-compatible CSP).
- `functions/api/info.ts` — edge function: JSON `{ ip, asn, org, country, ... }`.
- `functions/ip.ts` — edge function: plain-text IP (`curl whatsip.nl/ip`).

## Deploy

Cloudflare Pages via Git integration (push to `main` → production, PR → preview).
Full runbook: [`CLOUDFLARE.md`](./CLOUDFLARE.md).

## Develop

```bash
npm install
npm run dev        # wrangler pages dev (local edge runtime)
npm run typecheck
```
