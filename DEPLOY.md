# Deploying whatsip.nl (Cloudflare Pages)

Static assets live in `public/`, edge functions in `functions/`. No build step.
`wrangler.toml` sets `pages_build_output_dir = "public"`, so both the dashboard
and the CLI know where the site is.

## Prerequisites

- [ ] Repo pushed to GitHub: `git push -u origin main`.
- [ ] `whatsip.nl` is an **active Cloudflare zone** (see step 1).

---

## 1. Make `whatsip.nl` a Cloudflare zone

1. Cloudflare dashboard → **Add a site** → `whatsip.nl` → Free plan.
2. Cloudflare shows **two nameservers**. At your `.nl` registrar, replace the
   current nameservers with those two.
3. Wait for the zone status to flip to **Active** (minutes to a few hours).

> `.nl` cannot be registered *at* Cloudflare; keep it at your registrar and just
> point the nameservers. Once Active, Cloudflare manages DNS + TLS automatically.

---

## 2A. Connect Pages to GitHub (recommended — this is the pipeline)

1. Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Authorise GitHub, pick `Struis112/whatsip.nl`, branch `main`.
3. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: **public**  (or leave blank — read from `wrangler.toml`)
4. **Save and Deploy**. You get a `*.pages.dev` URL. Functions in `functions/`
   are detected automatically (TypeScript is bundled for you).

From now on: push to `main` → production deploy; open a PR → preview URL.

## 2B. Alternative: deploy from the CLI

```bash
npx wrangler login                 # browser OAuth, once
npx wrangler pages project create whatsip --production-branch main
npx wrangler pages deploy public   # deploys; functions/ picked up automatically
```

---

## 3. Map the custom domain

In the Pages project → **Custom domains** → **Set up a domain**:

- Add `whatsip.nl` (apex) and `www.whatsip.nl`.
- Cloudflare creates the DNS records itself (zone is in the same account).
- Decide canonical host (apex `whatsip.nl`); add a redirect rule
  `www.whatsip.nl/* → https://whatsip.nl/$1` (Rules → Redirect Rules).

---

## 4. Verify

```bash
curl -s https://whatsip.nl/ip            # plain-text IP
curl -s https://whatsip.nl/api/info      # JSON
curl -sI https://whatsip.nl/             # check HSTS + CSP headers present
curl -s https://whatsip.nl/ads.txt       # AdSense authorisation file
```

Open the site: IP shows instantly, Copy works, dark/light toggles.

---

## 5. AdSense go-live

1. AdSense dashboard → **Sites** → add `whatsip.nl` → request review.
2. **Ad units** → create a *Display* unit → copy its `data-ad-slot` id →
   replace `data-ad-slot="0000000000"` in `public/index.html`. (Or enable
   **Auto ads** and delete the `<ins>` block.)
3. Confirm `ads.txt` is reachable (step 4) so AdSense stops warning.
4. If ads don't render, widen the `script-src` / `frame-src` allowlist in
   `public/_headers` (CSP is the usual culprit).

---

## Rollback

Pages keeps every deployment. Dashboard → the project → **Deployments** →
pick a previous good build → **Rollback**. (Git-anchored: revert the commit and
push to roll forward cleanly.)
