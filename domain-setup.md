# Domain Setup for `infrazz.com` on GitHub Pages

Platform: GitHub Pages

Repository: `infrazz/webui`

## Goal

Expose the website publicly with:

- `https://www.infrazz.com` as the main website
- `https://infrazz.com` redirecting to `https://www.infrazz.com`

This is the recommended GitHub Pages setup because GitHub recommends using `www` together with the apex domain for a more reliable and secure configuration.

## Prerequisites

- The domain `infrazz.com` is already purchased
- The DNS for the domain is managed by a DNS provider such as Cloudflare
- The GitHub repository `infrazz/webui` exists for the website
- GitHub Pages is enabled for that repository

## Recommended Architecture

- DNS provider hosts the zone for `infrazz.com`
- GitHub Pages hosts the static website
- `www.infrazz.com` is configured as the custom domain in GitHub Pages
- `infrazz.com` points to GitHub Pages and redirects to `www.infrazz.com`
- GitHub provisions the HTTPS certificate automatically after DNS is correct

## Step 1: Create the GitHub Pages Site

This repo already contains the minimum files to publish with GitHub Pages through GitHub Actions:

- `index.html`
- `.nojekyll`
- `.github/workflows/deploy-pages.yml`

Also present:

- `CNAME`

Important:

- This repository deploys with a custom GitHub Actions workflow
- In this mode, GitHub Pages uses the custom domain configured in repository settings
- GitHub's documentation says an existing repository `CNAME` file is ignored and is not required for custom GitHub Actions workflows
- Keep the repository `CNAME` file only as a convenience or reminder, not as the source of truth

Push the repository to GitHub so the workflow can run.

## Step 2: Enable GitHub Pages

In the GitHub repository:

1. Open `Settings`
2. Open `Pages`
3. Under `Build and deployment`, choose the source
4. Select `GitHub Actions`
5. Save the configuration

Wait for the initial GitHub Pages URL to become available, such as:

- `https://infrazz.github.io/webui/`

Verify that the site loads there before adding the custom domain.

## Step 3: Verify the Domain in GitHub

This step is strongly recommended to reduce takeover risk.

In GitHub:

1. Go to your account or organization `Settings`
2. Open `Pages`
3. Choose `Add a domain`
4. Enter `infrazz.com`
5. GitHub will show a TXT record to create in DNS

Create the TXT record exactly as GitHub provides it. Keep it in DNS so the domain remains verified.

## Step 4: Add DNS Records

If DNS is managed in Cloudflare, create these records.

### Apex domain

Create four `A` records for `infrazz.com`:

```txt
Type   Name   Value
A      @      185.199.108.153
A      @      185.199.109.153
A      @      185.199.110.153
A      @      185.199.111.153
```

Optional:

- If your DNS provider supports `AAAA` records and you want IPv6 support, GitHub also documents these IPv6 addresses for the apex domain:

```txt
Type   Name   Value
AAAA   @      2606:50c0:8000::153
AAAA   @      2606:50c0:8001::153
AAAA   @      2606:50c0:8002::153
AAAA   @      2606:50c0:8003::153
```

### WWW subdomain

Create one `CNAME` record:

```txt
Type    Name   Value
CNAME   www    infrazz.github.io
```

### Domain verification TXT record

Also create the TXT record GitHub gives you during domain verification.

### Cloudflare proxy mode

For the initial setup, set these DNS records to `DNS only` instead of proxied. This avoids certificate and validation issues while GitHub Pages is issuing the certificate.

After the site is working, you can decide whether to keep Cloudflare proxy disabled or test it carefully. For a straightforward GitHub Pages setup, `DNS only` is the safer default.

## Step 5: Set the Custom Domain in GitHub Pages

In the repository:

1. Open `Settings`
2. Open `Pages`
3. Under `Custom domain`, enter:

```txt
www.infrazz.com
```

4. Save

Important for this repo:

- Because this repo uses a custom GitHub Actions workflow, GitHub does not create a repository `CNAME` file for you
- The custom domain value in repository `Settings -> Pages` is the authoritative setting
- The checked-in `CNAME` file in this repo is optional and not relied on by GitHub Pages for this workflow

- Use `www.infrazz.com` as the custom domain
- Do not set the custom domain to both `infrazz.com` and `www.infrazz.com` manually in separate places
- GitHub Pages will handle the redirect between the apex and `www` when DNS is configured correctly

## Step 6: Wait for DNS Propagation

DNS updates may take a few minutes or a few hours depending on TTL and provider propagation.

Checks:

- `www.infrazz.com` should resolve to `infrazz.github.io`
- `infrazz.com` should resolve to the GitHub Pages IP addresses
- The GitHub Pages settings page should stop showing DNS warnings

## Step 7: Enable HTTPS

After DNS is valid and GitHub finishes certificate provisioning:

1. Open repository `Settings`
2. Open `Pages`
3. Wait until the `Enforce HTTPS` checkbox becomes available
4. Enable `Enforce HTTPS`

At this point:

- `https://www.infrazz.com` should load the website
- `https://infrazz.com` should redirect to `https://www.infrazz.com`

## Cloudflare Example

If `infrazz.com` uses Cloudflare DNS, the final record set will look similar to this:

```txt
A      @      185.199.108.153   DNS only
A      @      185.199.109.153   DNS only
A      @      185.199.110.153   DNS only
A      @      185.199.111.153   DNS only
CNAME  www    infrazz.github.io   DNS only
TXT    _github-pages-challenge-...  <value-from-github>
```

Optional IPv6:

```txt
AAAA   @      2606:50c0:8000::153   DNS only
AAAA   @      2606:50c0:8001::153   DNS only
AAAA   @      2606:50c0:8002::153   DNS only
AAAA   @      2606:50c0:8003::153   DNS only
```

## Troubleshooting

### `Enforce HTTPS` is disabled

Possible causes:

- DNS is not fully propagated yet
- The `www` CNAME is wrong
- Cloudflare proxy is enabled during validation
- The custom domain in GitHub Pages does not match the DNS records

### `www.infrazz.com` does not load

Check:

- The `CNAME` points to `infrazz.github.io`
- The repository Pages site is already published
- The custom domain in GitHub is set to `www.infrazz.com`
- GitHub Pages source is set to `GitHub Actions`

### `infrazz.com` does not redirect

Check:

- All four GitHub Pages `A` records exist
- The custom domain is set to `www.infrazz.com`
- DNS propagation is complete

### There is a domain conflict warning in GitHub

Check:

- Domain verification TXT record is present
- The domain is not already claimed by another repository
- The custom domain value is entered only for the intended repository
- There are no wildcard DNS records such as `*.infrazz.com`

## Notes

- GitHub Pages is suitable for static sites, documentation sites, and frontend-only websites
- GitHub Pages is not suitable for backend APIs, databases, or server-side applications
- If later you need a backend, keep GitHub Pages for the frontend and host the API elsewhere
- This repo is set up so `main` deploys automatically through GitHub Actions

## References

- GitHub Docs: About custom domains and GitHub Pages
  https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages
- GitHub Docs: Managing a custom domain for your GitHub Pages site
  https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- GitHub Docs: Verifying your custom domain for GitHub Pages
  https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages
- GitHub Docs: Troubleshooting custom domains and GitHub Pages
  https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages
- GitHub Docs: Using custom workflows with GitHub Pages
  https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
