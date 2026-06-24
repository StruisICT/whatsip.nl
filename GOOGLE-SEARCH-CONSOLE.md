# Google Search Console Setup

## Submit Sitemap

1. **Go to**: https://search.google.com/search-console
2. **Add property**: `whatsip.nl` (domain property)
3. **Verify ownership**: 
   - Option A: DNS TXT record (recommended)
   - Option B: HTML file upload to `/google-verification.html`
   - Option C: Meta tag (can add to build script)
4. **Submit sitemap**: https://whatsip.nl/sitemap.xml

## Expected URLs in sitemap

- 14 total URLs (7 tools × 2 languages)
- English: `/en/`, `/en/browser`, `/en/headers`, `/en/webrtc`, `/en/ipv6`, `/en/dns`, `/en/privacy`
- Dutch: `/nl/`, `/nl/browser`, `/nl/headers`, `/nl/webrtc`, `/nl/ipv6`, `/nl/dns`, `/nl/privacy`

## Hreflang Verification

After indexing starts, check:
- Search Console → **International Targeting** → **Language** tab
- Should show no hreflang errors
- Each page should list alternates: `en`, `nl`, `x-default`

## Expected Results

- **Primary keywords**: "what is my ip", "wat is mijn ip", "ip address", "dns leak test"
- **Target markets**: Netherlands (primary), international (English)
- **Mobile-friendly**: Yes (verified in build)
- **Core Web Vitals**: LCP <2.5s, CLS <0.1 (check Performance report)

## Monitoring

Check monthly:
- **Coverage** → no errors or warnings
- **Performance** → trending up (impressions, clicks)
- **Core Web Vitals** → all URLs in "Good" category
- **Mobile Usability** → no issues

