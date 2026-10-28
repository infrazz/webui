# Phase 2 plan: launch readiness

Written 28 Oct 2026 by Claude Code from `SPEC.md`. One commit per task on branch `launch-readiness`
(from `claude-style-pricing`), each followed by a commit ticking it in `STATE.md`.

Test harness (not in the repo): serve `public/` locally, Playwright at 390px and 1280px, DNS-over-HTTPS
responses mocked with `page.route` for `dns.google` and `cloudflare-dns.com`.

| Task | Files | Change | Check |
|---|---|---|---|
| T2.4 | none | Read Actions runs and logs; open infrazz-web.pages.dev | Latest main run green; secrets show as masked in logs; site answers 200 |
| T2.2 | none | PR for `claude-style-pricing` (already open as #5) | PR open, preview link posted and working |
| docs | `docs/project/*` | Commit spec, state, claims check and this plan | Files in git |
| T2.3 | `public/index.html` | Claims C1, C3 (FAQ), C5 (Secure Team note), C6 (Secure Team tick and JSON-LD) | Wording matches `claims-check.md` exactly |
| T2.9 | `public/assets/site.css`, `public/assets/check.js` | `.next[hidden]` hidden; 8 s timeout per lookup, fall back to the next resolver and keep using it; clear timeout message | No visible `#next` while checking or after an error; both resolvers hung ends with a message in under 20 s; one hung resolver still completes |
| T2.10 | `public/index.html`, `public/check/index.html`, `public/assets/site.js` | Booking buttons `hidden` with no `href` until a link is set; `<noscript>` note on the Health Check | JS off: no `a[href="#"]`, no visible booking button, note visible |
| T2.11 | `public/assets/site.css` | Header button, pricing tabs, logo and footer links at least 44px tall on phones | At 390px every visible link, button, summary and input is at least 44px tall (links inside a sentence excepted) |
| T2.12 | `public/index.html`, `public/check/index.html`, `public/assets/site.css` | "We reply within 1 working day" by hero and contact buttons and in the fix box | Line visible in all three places |
| A8 | `public/index.html` | Price row in the comparison table; every D3 price in the JSON-LD | Cards, table and JSON-LD all match D3 |
| T2.6 | GitHub | Delete remote `relaunch` and `cloudflare-pages` | `git ls-remote` no longer lists them |
| T2.7 | wiki repo, `Delivery/package-checklists.md` | Commit on `relaunch`, push, PR into `main` | PR open |
| T2.1 | `public/assets/site.js`, HTML hrefs | WhatsApp number and booking link | Only when the owner sends them |
