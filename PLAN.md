# whatsip.nl — release plan

A tiny, **very fast** "what's my IP" site. Edge-served, no framework, privacy-first.

## Architecture (Option A — Cloudflare Pages + edge function)

- **Static** `index.html` + inlined critical CSS + minimal JS on Cloudflare Pages CDN
  (unlimited requests/bandwidth, free).
- **Edge function** (`functions/ip.ts`) returns the visitor IP from `CF-Connecting-IP`
  — answered at Cloudflare's edge, no origin hop → sub-50ms globally.
- **Fully decoupled** from any home/agent box. A public site must never share an
  origin with a shell-capable service.

```
visitor ──https──> Cloudflare edge
                     ├─ /            static HTML (CDN, instant)
                     ├─ /ip          plain-text IP (curl-friendly)  ── edge function
                     └─ /api/info    JSON: ip, asn, country, ua     ── edge function
```

## Why not Next.js / not the PM2 monorepo

- Next static export ships ~90 KB+ React runtime for one page — slower, no benefit.
- Routing a public site through the PM2/home box = slower + couples it to the agent host.
- Cloudflare hosting cost is identical either way; plain HTML wins on speed + simplicity.

## Pipeline

1. **Source** — this repo: `index.html`, `style.css` (inlined at build), `functions/`.
2. **Validate** — HTML/CSS lint, link check, **Lighthouse budget gate** (perf ≥ 95,
   no render-blocking, TBT low), edge-function smoke (returns 200 + valid IP).
3. **Preview** — Cloudflare Pages preview URL per PR.
4. **Promote** — merge to `main` → Pages production deploy.
5. **Verify** — synthetic check on `/ip` + TLS/HSTS headers.
6. **Guardrails** — caching + security headers (CSP, HSTS), rate-limit the IP function.

## Content

- Big IP readout (copy-on-click), IPv4 + IPv6 when present.
- Secondary: ASN / org, country/city (CF geo), reverse DNS.
- "Show request headers" — progressive disclosure.
- `/ip` plain-text endpoint (`curl whatsip.nl/ip`).
- Dark/light, **WCAG 2.2 AAA** contrast, no cookies, no trackers.
- SEO/content pages (also needed for AdSense approval): What is an IP · IPv4 vs IPv6 ·
  Public vs private IP · FAQ · Privacy policy.

## Costs (see chat analysis)

- Static hosting: **$0** (unlimited). Edge function: free ≤ 3M views/mo, then $5/mo to 10M.
- Domain `.nl`: ~€10/yr at registrar, NS → Cloudflare.
- **AdSense**: low RPM utility niche ($0.5–3/1k views), high ad-block audience. Ship
  fast/ad-free first, lazy-load ads after first paint, add content pages for approval.

## Open items

- [ ] Move `whatsip.nl` to a Cloudflare zone (status: "almost").
- [ ] Decide field set for the IP page.
- [ ] AdSense: defer until content pages + traffic exist.
- [ ] Repo public or private (currently private).
