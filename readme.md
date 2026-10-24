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
wrangler.jsonc        Cloudflare Pages config (publishes ./public)
.github/workflows/deploy.yml   CI/CD: checks, then deploys to Cloudflare Pages
```

## Things to fill in

1. **WhatsApp and booking link**: top of `public/assets/site.js`:
   ```js
   whatsapp: '65XXXXXXXX',                       // digits only, with 65
   booking:  'https://meetings.hubspot.com/...'  // HubSpot free meetings link
   ```
   Until these are set, WhatsApp buttons become "Email us" and booking buttons are hidden.
2. **Prices**: the amounts in `public/index.html` (search for `PRICES:`), three packages (Starter, Business, Secure Team),
   two Care Plans and the add-ons. They are proposed prices and still need your decision.

## Preview locally

```
cd public
python -m http.server 8000
```
Open http://localhost:8000. The Health Check needs internet access (it calls Google and Cloudflare public DNS).

## Hosting: Cloudflare Pages

GitHub Actions (`.github/workflows/deploy.yml`) deploys the site:

- **Every pull request**: checks run, then a preview is deployed and its `*.pages.dev` URL is posted on the PR.
- **Every push to `main`**: checks run, then the site is deployed to production (`infrazz-web.pages.dev`, plus custom domains once added).
- **Manual**: Actions > Deploy to Cloudflare Pages > Run workflow.

The checks run `wrangler pages project validate` and confirm every local link and asset in the HTML exists.
The first deploy creates the `infrazz-web` Pages project if it doesn't exist.

### One-time setup

1. In Cloudflare: **My Profile > API Tokens > Create Token > Custom token**, with permission
   **Account > Cloudflare Pages > Edit** on the Infrazz account. Copy the token.
2. Copy the **Account ID** from the right-hand side of any zone's Overview page in the Cloudflare dashboard.
3. In GitHub: **infrazz/webui > Settings > Secrets and variables > Actions > New repository secret**:
   `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
4. **Actions > Deploy to Cloudflare Pages > Run workflow** on `main`. Check the site on `https://infrazz-web.pages.dev`.

### Go-live

1. Pages project **infrazz-web > Custom domains > Set up a custom domain**: add `www.infrazz.com`, then `infrazz.com`.
   Cloudflare asks to replace the existing GitHub Pages records (4 `A` records on `@`, `CNAME www`). Accept.
   Leave the MX and TXT (email) records alone.
2. **Rules > Redirect Rules**: redirect `infrazz.com/*` to `https://www.infrazz.com/${1}` (301, keep query string).
3. Check: https://www.infrazz.com loads, https://infrazz.com redirects, `/check/?d=infrazz.com` runs.
4. A week later, if all is well: turn off GitHub Pages in the repo settings.

### Rollback

- **Site content**: in the Pages project, open **Deployments**, pick the last good one and choose **Rollback to this deployment**.
  Or `git revert` the bad commit on `main` and push. (The old placeholder site is tagged `v0-placeholder`.)
- **Hosting**: remove the two custom domains from the Pages project, re-add the GitHub Pages records
  (`A @ 185.199.108.153`, `.109.153`, `.110.153`, `.111.153`, `CNAME www infrazz.github.io`, all DNS only)
  and set the custom domain back to `www.infrazz.com` in the repo's Pages settings.
  To redeploy to GitHub Pages, restore the old workflow first: `git checkout 1468381 -- .github/workflows/deploy-pages.yml .nojekyll`.
