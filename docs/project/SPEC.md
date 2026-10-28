# Infrazz relaunch: build spec, phase 2 (launch readiness)

Source of truth: the Infrazz Launch Hub (plan v3, signed off 28 Oct 2026) at https://claude.ai/artifact/5EFVUEvCnUL2Be7SuwPUmd.
Progress is tracked in `docs/project/STATE.md`.

## Goal

Make www.infrazz.com ready to go live on **Tue 3 Nov 2026**: fixed-price IT support for Singapore small businesses. Marketing starts after go-live.

## Approved decisions (all 13 Approved)

| # | Decision |
|---|---|
| D1 | Market: Singapore small businesses with 1 to 30 people |
| D2 | Headline: "Experienced IT support for small businesses" (from `claude-style-pricing`) |
| D3 | Prices locked: Starter S$290, Business S$1,290, Secure Team S$2,290; Care Plan S$49/month; Care Plan Plus S$15 per person/month; Cyber Essentials Ready S$990; extra people S$30, extra laptops S$60 |
| D4 | Hosting: Cloudflare Pages via GitHub Actions (`.github/workflows/deploy.yml`); PRs get preview links |
| D5 | Own email: Cloudflare Email Routing plus a DMARC record |
| D6 | Claude builds on a branch and opens a PR with a preview; the owner reviews and merges |
| D7 | S$0 promotion for the first 60 days |
| D8 | Email Health Check at `/check/` is the lead tool |
| D9 | Contact: WhatsApp Business number, booking link, hello@infrazz.com |
| D10 | Go-live Tue 3 Nov 2026, if every test check passes or is waived |
| D11 | Channels after go-live: network at-cost jobs, Carousell, Google Business Profile, SME Facebook groups (no accountant outreach) |
| D12 | No customer target yet: website first, then marketing |
| D13 | Join the Google Workspace referral program; HubSpot dropped |

## Findings and choices

| # | Finding | Choice |
|---|---|---|
| 1 | Pricing/hero branch unmerged | 1A: open a PR for `claude-style-pricing`, check the preview, owner merges |
| 2 | Stale branches | 2A: delete `relaunch` and `cloudflare-pages` on GitHub |
| 3 | WhatsApp and booking empty | 3A: owner sends both before 3 Nov; insert them when received |
| 4 | Claims unchecked | 4A: apply the wording in `docs/project/claims-check.md` (C1, C3, C5, C6) |
| 5 | Secure Team delivery | 5A: checklist written in wiki `Delivery/package-checklists.md` |
| 6 | Launch copy stale | 6A: rewrite after go-live; merge the wiki `relaunch` branch now |
| 7 | Live deploy unconfirmed | Check GitHub Actions and https://infrazz-web.pages.dev and report |
| 8 | Health Check empty box and hangs | 8A: hide `.next` when `hidden`; 8-second timeout per DNS lookup, then fall back to the next resolver |
| 9 | No-JavaScript behaviour | 9A: real WhatsApp/booking links in the HTML once known; booking buttons `hidden` in the HTML until a link is set; `<noscript>` note on the Health Check |
| 10 | Tap targets under 44px | 10A: header button, pricing tabs, logo and footer links at least 44px tall on phones |
| 11 | No reply-time promise | 11A: "We reply within 1 working day" by the hero and contact buttons and in the Health Check fix box |

## Phase 2 deliverables

1. PR: `claude-style-pricing` into `main` (finding 1). Owner reviews the preview and merges.
2. Branch `launch-readiness` from `claude-style-pricing`, one commit per task, PR into `main` (stack on the pricing PR until it merges):
   - T2.3 claim wording (finding 4), including the JSON-LD
   - T2.9 Health Check fixes (finding 8)
   - T2.10 no-JavaScript fixes (finding 9)
   - T2.11 44px tap targets (finding 10)
   - T2.12 reply-time promise (finding 11)
   - Commit this folder (`docs/project/`)
3. T2.1 when the owner sends them: WhatsApp number and booking link in `public/assets/site.js` and in the HTML hrefs.
4. T2.6 delete remote branches `relaunch` and `cloudflare-pages` (approved, finding 2).
5. T2.7 wiki repo: commit `Delivery/package-checklists.md` on the wiki `relaunch` branch, then open a PR into the wiki's `main`.
6. T2.4 report on GitHub Actions and the pages.dev site (finding 7).

## Acceptance checks for this phase

- A5: the Health Check on infrazz.com shows no Problem results (once the owner adds DMARC)
- A6: a Google Workspace domain and a Microsoft 365 domain each name the right provider
- A7: a misspelled domain shows the "couldn't find" message
- A8: prices in the cards, comparison table and JSON-LD all match D3
- A9: a PR gets a preview link posted and the preview works
- A10: an unknown path shows the Infrazz 404 page
- New for findings 8 to 11: no empty box while checking or after an error; a hung lookup ends within about 20 seconds with a clear message; with JavaScript off, no button points at `#` and the Health Check says it needs JavaScript; every tap target at 390px is at least 44px tall; the reply-time line shows by the contact buttons and the fix box

## Constraints

- Never push to `main`, merge a PR, spend money, change DNS or Cloudflare settings, or change GitHub secrets without asking the owner.
- Don't commit the owner's uncommitted edits to `domain-setup.md`.
- Git identity for everything under `C:\infrazz` comes from `C:\infrazz\.gitconfig-infrazz` (Infrazz <dev@infrazz.com>).
- Keep the site static: plain HTML, CSS and JS in `public/`, no build step, no new dependencies.

## Not in scope

Accounting, payroll and company registration; HubSpot; paid ads in the first 60 days; custom software; launch-copy rewrite (after go-live).
