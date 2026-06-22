# whatsip.nl

A tiny, very fast **what's-my-IP** site. Edge-served on Cloudflare Pages, no
framework, privacy-first (no cookies, no trackers).

See [`PLAN.md`](./PLAN.md) for the architecture, pipeline, and cost analysis.

## Status

Planning. Repo scaffolded; build not started.

## Quick links (planned)

- `index.html` — the page (static, CDN).
- `functions/ip.ts` — edge function: returns the visitor IP.
- `/ip` — `curl whatsip.nl/ip`.
