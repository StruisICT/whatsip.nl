# 🚀 whatsip.nl — status

**Live:** https://whatsip.nl · **Deploy:** Cloudflare Pages (auto-deploy from `main`)
**Last updated:** 2026-07-05

---

## Site at a glance

- **22 pages** total — 11 pages × 2 languages (EN / NL)
- **Sitemap:** https://whatsip.nl/sitemap.xml (22 URLs, hreflang + lastmod)
- **First visit:** ~15 KB; later pages mostly cached
- **Edge response:** <100 ms globally (Cloudflare)
- **No cookies, no tracking, no ads, IP never stored**

---

## Tools (8) + content pages (3)

| Page | Path | What it shows |
|------|------|---------------|
| My IP | `/` | Public IP (v4/v6), ISP/ASN, location, reverse DNS, **client-measured latency**, TLS/HTTP, timezone |
| Browser | `/browser` | Browser, platform, languages, timezone, screen, CPU cores, GPU, cookies, DNT, online |
| Headers | `/headers` | HTTP request headers (cookies redacted), copy as JSON |
| WebRTC | `/webrtc` | Local/public address exposure vs. your public IP |
| IPv6 | `/ipv6` | Protocol used + IPv6 capability (via `ipv4`/`ipv6.whatsip.nl`) |
| Storage | `/storage` | Cookies, LocalStorage, SessionStorage, IndexedDB, quota (`storage.estimate`), DNT |
| Geolocation | `/geolocation` | Browser geolocation (permission-gated) + OpenStreetMap link |
| Permissions | `/permissions` | Which permissions a site can request + their current state (read-only, requests nothing) |
| API | `/api` | Developer docs for the free, no-key endpoints (`/ip`, `/api/info`, `/api/headers`) |
| About | `/about` | What the site is, privacy stance, honesty about limits |
| Privacy | `/privacy` | Privacy policy |

---

## Honest-by-design decisions

- **No ads.** AdSense was removed entirely (rejected twice); the site is free, ad-free, and tracker-free.
- **No fake tests.** The Speed Test and DNS pages only linked out to external tools (a browser can't accurately measure a gigabit line, and a real DNS-leak test needs an authoritative DNS server) — with ads gone they added nothing, so they were removed in the July 2026 trim along with the FAQ and the per-tool explainer content that existed mainly for AdSense approval. Old URLs 301-redirect.
- Removed low-signal browser fields (device memory, pixel ratio, viewport, touch points, user agent).

---

## Infrastructure

- **Cloudflare Pages**, build `node scripts/build.mjs`, output `dist/`
- **Edge functions:** `/ip`, `/api/info`, `/api/headers`, `/` (Accept-Language redirect)
- **DNS zone** `whatsip.nl` (id `4e0018cc99e8b56fe2133a41d463d829`): apex, `www` (→ apex 301), `ipv4`, `ipv6`, mail/TXT. (Old `test1-5` records removed.)
- **Build:** `src/` templates + `strings.json` → 22 localized pages + per-language `i18n.en.js`/`i18n.nl.js` + `sitemap.xml`

---

## SEO

- Keyword-tuned titles/descriptions, Schema.org `WebApplication`, hreflang (en/nl/x-default), sitemap submitted to Google Search Console
- **No monetisation.** AdSense was removed entirely on 2026-07-05 after a second rejection — no ad scripts, no `ads.txt`, CSP tightened back to self-only.

---

## Outstanding (needs the owner)

1. Google Search Console: request re-indexing for updated pages
2. *(optional)* generate visual-regression baselines for the test suite
