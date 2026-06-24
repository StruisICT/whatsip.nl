# Setting up www.whatsip.nl

The redirect rule is already in place (`_redirects`), but you need to add `www.whatsip.nl` as a custom domain in Cloudflare Pages.

## Steps:

### 1. Add www as Custom Domain in Cloudflare Pages

1. Go to: https://dash.cloudflare.com/
2. Navigate to: **Pages** → **whatsip-nl project** → **Custom domains**
3. Click **Set up a custom domain**
4. Enter: `www.whatsip.nl`
5. Click **Continue**
6. Cloudflare will automatically create the DNS CNAME record
7. Wait for SSL certificate provisioning (~1-2 minutes)

### 2. Verify

Once the certificate is active:

```bash
curl -I https://www.whatsip.nl/
# Should show: HTTP/1.1 301 Moved Permanently
# Location: https://whatsip.nl/

curl -I https://www.whatsip.nl/en/
# Should redirect to: https://whatsip.nl/en/
```

### 3. The redirect rule

Already configured in `src/static/_redirects`:

```
https://www.whatsip.nl/* https://whatsip.nl/:splat 301
```

This redirects all `www` traffic to the apex domain with a 301 (permanent redirect) while preserving the path.

## Why apex domain (no www)?

- ✅ **Shorter, cleaner URLs** - `whatsip.nl` vs `www.whatsip.nl`
- ✅ **Better for branding** - Easier to remember and type
- ✅ **Slightly faster DNS** - One less DNS lookup
- ✅ **Modern convention** - Most new sites use apex domains
- ✅ **Works with curl** - `curl whatsip.nl/ip` is cleaner

The www subdomain will redirect for users who type it out of habit.
