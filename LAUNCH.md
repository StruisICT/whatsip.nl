# 🚀 whatsip.nl — status

**Live:** https://whatsip.nl · **Deploy:** Cloudflare Pages (auto-deploy from `main`)
**Last updated:** 2026-07-05

---

## Site at a glance

- **28 pages** total — 14 pages × 2 languages (EN / NL)
- **Sitemap:** https://whatsip.nl/sitemap.xml (28 URLs, hreflang + lastmod)
- **First visit:** ~15 KB; later pages mostly cached
- **Edge response:** <100 ms globally (Cloudflare)
- **No cookies, no tracking, no ads, IP never stored**

---

## Tools (10) + content pages (4)

| Page | Path | What it shows |
|------|------|---------------|
| My IP | `/` | Public IP (v4/v6), ISP/ASN, location, reverse DNS, **client-measured latency**, TLS/HTTP, timezone |
| Browser | `/browser` | Browser, platform, languages, timezone, screen, CPU cores, GPU, cookies, DNT, online |
| Headers | `/headers` | HTTP request headers (cookies redacted), copy as JSON |
| WebRTC | `/webrtc` | Local/public address exposure vs. your public IP |
| IPv6 | `/ipv6` | Protocol used + IPv6 capability (via `ipv4`/`ipv6.whatsip.nl`) |
| DNS | `/dns` | **Honest DNS-privacy guide**: links to a real leak test + DoH how-to (see note) |
| Storage | `/storage` | Cookies, LocalStorage, SessionStorage, IndexedDB, quota (`storage.estimate`), DNT |
| Geolocation | `/geolocation` | Browser geolocation (permission-gated) + OpenStreetMap link |
| Permissions | `/permissions` | Which permissions a site can request + their current state (read-only, requests nothing) |
| Speed Test | `/speed` | Links to trusted external tests (Cloudflare, Ookla, Google) — see note |
| API | `/api` | Developer docs for the free, no-key endpoints (`/ip`, `/api/info`, `/api/headers`) |
| FAQ | `/faq` | 8 Q&As on IP, IPv4/6, privacy, VPNs |
| About | `/about` | What the site is, privacy stance, honesty about limits |
| Privacy | `/privacy` | Privacy policy |

Every tool page carries a short bilingual **explainer** below the result.

---

## Honest-by-design decisions

- **Speed test links out.** A browser can't accurately measure a gigabit line (JS tests cap around 500–600 Mbps); rather than show misleading numbers, `/speed` links to trusted external tests (Cloudflare, Ookla, Google) with an explainer.
- **No ads.** AdSense was removed entirely (rejected twice); the site is free, ad-free, and tracker-free.
- **DNS page links out.** A real DNS-leak test needs an authoritative DNS server to see the resolver IP — impossible from a static site — so the page explains this and links to `dnsleaktest.com` instead of faking a verdict.
- Removed low-signal browser fields (device memory, pixel ratio, viewport, touch points, user agent).

---

## Infrastructure

- **Cloudflare Pages**, build `node scripts/build.mjs`, output `dist/`
- **Edge functions:** `/ip`, `/api/info`, `/api/headers`, `/` (Accept-Language redirect)
- **DNS zone** `whatsip.nl` (id `4e0018cc99e8b56fe2133a41d463d829`): apex, `www` (→ apex 301), `ipv4`, `ipv6`, mail/TXT. (Old `test1-5` records removed.)
- **Build:** `src/` templates + `strings.json` → 28 localized pages + per-language `i18n.en.js`/`i18n.nl.js` + `sitemap.xml`

---

## SEO

- Keyword-tuned titles/descriptions, Schema.org `WebApplication`, hreflang (en/nl/x-default), sitemap submitted to Google Search Console
- **No monetisation.** AdSense was removed entirely on 2026-07-05 after a second rejection — no ad scripts, no `ads.txt`, CSP tightened back to self-only.

---

## Outstanding (needs the owner)

1. Google Search Console: request re-indexing for updated pages
2. *(optional)* generate visual-regression baselines for the test suite
