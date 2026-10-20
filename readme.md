# infrazz/webui

The www.infrazz.com website. Plain HTML, CSS and JavaScript, no build step.

Only the `public/` folder is published. Everything else in the repo (this readme, `domain-setup.md`, config) stays private.

```
public/
  index.html          home page: promise, packages and prices, how it works, FAQ, contact
  check/index.html    free Email Health Check (MX, SPF, DKIM, DMARC)
  404.html            not-found page
  assets/site.css     all styles
  assets/site.js      CONTACT SETTINGS + home page preview
  assets/check.js     Health Check logic (runs in the visitor's browser)
  _headers            security headers (Cloudflare)
  robots.txt, sitemap.xml, favicon.svg
wrangler.jsonc        Cloudflare Workers config (static assets from ./public)
```

## Things to fill in

1. **WhatsApp and booking link**: top of `public/assets/site.js`:
   ```js
   whatsapp: '65XXXXXXXX',                       // digits only, with 65
   booking:  'https://meetings.hubspot.com/...'  // HubSpot free meetings link
   ```
   Until these are set, WhatsApp buttons become "Email us" and booking buttons are hidden.
2. **Prices**: the four amounts in `public/index.html` (search for `PRICES:`). They are the proposed prices from the plan and still need your decision.

## Preview locally

```
cd public
python -m http.server 8000
```
Open http://localhost:8000. The Health Check needs internet access (it calls Google and Cloudflare public DNS).

## Hosting: Cloudflare Workers

### One-time setup (about 5 minutes)

1. Push this branch: `git push -u origin relaunch`.
2. In the Cloudflare dashboard: **Workers & Pages > Create > Import a repository** and pick `infrazz/webui`.
   - Production branch: `main`
   - Build command: leave empty
   - Deploy command: `npx wrangler deploy`
3. In the Worker's **Settings > Build**, turn on **builds for non-production branches**
   (deploy command `npx wrangler versions upload`). Each push to `relaunch` then gets its own preview URL on workers.dev.
   Open that URL on your phone to review before go-live.

Builds of `main` will fail until `relaunch` is merged, because `main` has no `wrangler.jsonc` yet. That's expected and harmless.

### Go-live

1. Merge `relaunch` into `main` and push. Cloudflare deploys the Worker.
   GitHub Pages also redeploys from `public/`, so the live site is correct on both until DNS moves.
2. Worker **Settings > Domains & Routes > Add > Custom domain**: add `www.infrazz.com`, then `infrazz.com`.
   Cloudflare asks to replace the existing GitHub Pages records (4 `A` records on `@`, `CNAME www`). Accept.
   Leave the MX and TXT (email) records alone.
3. **Rules > Redirect Rules**: redirect `infrazz.com/*` to `https://www.infrazz.com/${1}` (301, keep query string).
4. Check: https://www.infrazz.com loads, https://infrazz.com redirects, `/check/?d=infrazz.com` runs.
5. A week later, if all is well: turn off GitHub Pages in the repo settings and delete `.github/workflows/deploy-pages.yml`.

### Rollback

- **Site content**: `git revert` the merge on `main` (old site is tagged `v0-placeholder`) and push.
- **Hosting**: remove the two custom domains from the Worker, re-add the GitHub Pages records
  (`A @ 185.199.108.153`, `.109.153`, `.110.153`, `.111.153`, `CNAME www infrazz.github.io`, all DNS only)
  and set the custom domain back to `www.infrazz.com` in the repo's Pages settings.
