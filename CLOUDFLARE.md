# Cloudflare setup — whatsip.nl

The site is **Cloudflare Pages**: templates in `src/` are built by `scripts/build.mjs`
into `dist/` (static `/en` + `/nl` pages), served alongside edge `functions/`. No tunnel,
no origin server. The release pipeline is Pages' **Git integration**: push to
`main` → production deploy; open a PR → preview deploy; history → one-click rollback.

Use the **same Cloudflare account** that already hosts `dstruis.eu` (free plan, many
zones allowed).

## Step 1 — Add whatsip.nl as a Cloudflare zone (DNS)

1. Cloudflare dashboard → **Add a site** → `whatsip.nl` → Free plan.
2. Cloudflare gives you **2 nameservers**. At your `.nl` registrar, replace the
   nameservers with those two.
3. Wait for the zone status to flip to **Active** (minutes–hours).

> A Pages custom domain requires the domain to be a zone on this account, because
> Cloudflare adds the DNS record for you. So this step is the prerequisite.

## Step 2 — Create the Pages project (Git integration)

1. Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Authorise GitHub, pick **`Struis112/whatsip.nl`**.
3. Build settings:
   - Framework preset: **None**
   - Build command: **`npm run build`**  (runs `scripts/build.mjs` → `dist/`)
   - Build output directory: **`dist`**
   - Root directory: **`/`**
   - (Functions in `/functions` — incl. the `/` language router — are auto-detected.)
4. **Save and Deploy.** First build publishes to `https://whatsip.pages.dev`.

> The site is **bilingual**: content lives at `/en/…` and `/nl/…`, generated from
> `src/` by the build. Visiting `/` 302-redirects to `/nl/` or `/en/` by
> `Accept-Language` (the `functions/index.ts` router).

Production branch = `main`. Every push to `main` deploys to production; every PR
gets its own `*.whatsip.pages.dev` preview URL.

## Step 3 — Map the domain

1. Pages project → **Custom domains** → **Set up a custom domain**.
2. Add **`whatsip.nl`** and **`www.whatsip.nl`** (Cloudflare creates the DNS).
3. (Optional) Redirect `www` → apex with a Bulk Redirect or a `_redirects` rule.

## Step 4 — Verify

```bash
curl -s https://whatsip.nl/ip            # your IP, plain text
curl -s https://whatsip.nl/api/info      # JSON
curl -sI https://whatsip.nl/ | grep -i strict-transport   # HSTS present
curl -s https://whatsip.nl/ads.txt       # AdSense authorisation
```

Open the page → IP shows instantly, Copy works, dark/light toggles.

## Step 5 — AdSense go-live

1. In AdSense → **Sites** → add `whatsip.nl` → request review.
2. Create a **display ad unit**, copy its **slot ID**, and replace
   `data-ad-slot="0000000000"` in the **5 `src/pages/*.html` templates** — home,
   browser, headers, webrtc, ipv6 (or enable Auto Ads and remove the `<ins>`
   blocks), then rebuild.
3. If ads don't render, widen the `script-src` / `frame-src` allowlist in
   `src/static/_headers` (CSP is the usual culprit).

## Alternative — deploy from the CLI (for a quick test before Git is connected)

```bash
npm install
npx wrangler login                 # browser OAuth
npx wrangler pages project create whatsip --production-branch main
npm run deploy                     # build + wrangler pages deploy dist
```

This gives an immediate `*.pages.dev` URL but **no auto-deploy on push** — prefer
the Git integration (Step 2) as the real pipeline.

## Rollback

Pages keeps every deployment. Project → **Deployments** → pick a known-good →
**Rollback**. (Git-anchored: matches the project's "live = last known-good" model.)
