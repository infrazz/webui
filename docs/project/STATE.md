# Project state

Hub: https://claude.ai/artifact/5EFVUEvCnUL2Be7SuwPUmd (Infrazz Launch Hub)
Spec: `docs/project/SPEC.md`

- **Stage:** 4 of 6, Implement
- **Phase:** 2, Launch readiness (28 Oct to 2 Nov 2026)
- **Go-live:** Tue 3 Nov 2026
- **Updated:** 2026-10-28 by Claude Code

This file is the record while the hub is out of reach (Claude Code can't write to the hub). Tick tasks here with the commit hash; the next Claude session with hub access copies the state across.

## Phase 1: Relaunch site (done)

- [x] T1.1 New home page, packages and prices (`00379b4`, PRs #1, #3, #4)
- [x] T1.2 Email Health Check at /check/ (`103fcf9`, PR #1)
- [x] T1.3 Cloudflare Pages hosting with PR previews (`201f182`, PR #2)
- [x] T1.4 Tabbed pricing and SEO hero, branch `claude-style-pricing` (`12cf04c`), PR #5 open (finding 1)

## Phase 2: Launch readiness

| Task | Owner | Status | Commit / note |
|---|---|---|---|
| T2.1 WhatsApp number and booking link in site.js and HTML | Owner sends, Claude Code inserts | To do | |
| T2.2 Open PR for `claude-style-pricing`; owner merges after preview | Claude Code, then owner | PR open, owner to merge | PR #5 (open since 24 Oct); preview https://claude-style-pricing.infrazz-web.pages.dev |
| T2.3 Claim wording (claims-check.md C1, C3, C5, C6) | Claude Code | Done 28 Oct | `6b399e3` |
| T2.4 Check Actions runs and infrazz-web.pages.dev | Claude Code | Done 28 Oct | All runs since 20 Oct green; both secrets masked (set) in run logs; production serves PR #4 content |
| T2.5 DMARC record in Cloudflare | Owner | To do | |
| T2.6 Delete remote branches `relaunch`, `cloudflare-pages` | Claude Code | To do | approved (2A) |
| T2.7 Wiki: commit checklists, PR `relaunch` into `main` | Claude Code | To do | |
| T2.8 Delivery checklist per package | Claude (chat) | Done 28 Oct | wiki `Delivery/package-checklists.md`, uncommitted |
| T2.9 Health Check: hide empty box, lookup timeouts (finding 8) | Claude Code | Done 28 Oct | `0802b0e`; mocked tests: both resolvers hung ends in 16 s, one hung finishes in 8 s |
| T2.10 No-JavaScript fixes (finding 9) | Claude Code | Done 28 Oct | `3bc73c7` |
| T2.11 44px tap targets (finding 10) | Claude Code | Done 28 Oct | `f62c1c0`; Playwright: every target at 390px on /, /check/ and 404 at least 44px |
| T2.12 "We reply within 1 working day" (finding 11) | Claude Code | Done 28 Oct | `9bf2eaf` |

## Log

- 2026-10-28: Plan v3 signed off on the hub. Claims checked and delivery checklists written (Claude, chat). Phase 2 handed to Claude Code.
