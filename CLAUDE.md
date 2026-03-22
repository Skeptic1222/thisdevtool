# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: DevToolbox — Repeat-Use Workbench

Ad-revenue developer/SEO/text tool site. 100% client-side JavaScript, hosted on Cloudflare Pages ($0/month). Monetized via AdSense → Mediavine Journey → Mediavine/Raptive.

## Architecture

Same architecture as CalcHub (sibling project at `D:\Projects\businessideas\calchub`):
- **Static HTML pages** — no framework, no build step
- **Rebranded CSS/JS** from CalcHub — emerald/teal accent (`#10b981`) instead of CalcHub's blue
- Each tool page is self-contained with inline `<script>`
- WebApplication schema + FAQ schema on every tool page
- Dark/light mode, ad slot placeholders (banner, sidebar, inline)
- Global namespace: `window.DevToolbox` (not CalcHub)

## What's Built

- `css/style.css` — Full design system (rebranded from CalcHub with dev-tool additions: split panes, code output, status bars, option chips)
- `js/core.js` — Core utilities: theme toggle, FAQ, `copyToClipboard()`, `downloadText()`, `readFileAsText()`, `debounce()`, `formatBytes()`, analytics
- `index.html` — Home page with all 38 tool cards + category filter (Dev/SEO/Text/Generator/Accessibility)
- `tools/json-formatter.html` — **TEMPLATE TOOL** — JSON formatter/validator with split pane, mode chips, live validation, copy/download, 500+ words SEO, FAQ schema. **Use this as the pattern for ALL other tools.**
- `legal/privacy.html`, `legal/terms.html` — Ad-network compliant legal pages

## Key Patterns (Follow json-formatter.html)

- **Split pane layout** — input textarea on left, code-output div on right (stacks on mobile)
- **Option chips** — mode toggles at top (e.g., "2 spaces" / "4 spaces" / "tabs" / "minify")
- **Live processing** — use `DevToolbox.debounce(process, 150)` on input events
- **Status bar** — `.status-bar.valid` / `.status-bar.invalid` / `.status-bar.info` below the split pane
- **Copy/Download buttons** — use `DevToolbox.copyToClipboard(text, btn)` and `DevToolbox.downloadText(content, filename, mime)`
- **SEO content** — 500+ words of how-to + explanation below the tool
- **FAQ schema** — both in `<script type="application/ld+json">` and as visible `.faq-section`
- **WebApplication schema** — in head for Google rich results
- **Tab key support** — intercept Tab in textareas to insert spaces instead of changing focus

## Tools to Build (Priority Order)

**Developer (highest traffic):**
1. JSON formatter/validator (100-300K searches/mo)
2. Base64 encoder/decoder (50K+)
3. Regex tester with visual explanation (30-60K)
4. JWT decoder — warn "doesn't validate" (20K+)
5. UUID generator (15K+)
6. Cron parser/generator (10K+)
7. Hash generator — SHA256 via Web Crypto API (10K+)
8. Diff checker (text/JSON/code)
9. Timestamp/epoch converter
10. CSV↔JSON converter
11. SQL formatter
12. Markdown preview
13. HTML↔Markdown converter
14. YAML↔JSON converter
15. .env redactor/share viewer

**SEO (high CPM — B2B advertisers):**
16. Meta tag generator/analyzer
17. Schema JSON-LD generators (FAQ, HowTo, Article, Product, LocalBusiness)
18. SERP preview
19. Robots.txt generator
20. OG/Twitter card preview
21. UTM bulk builder
22. Canonical tag checker
23. Hreflang tag builder
24. Slug bulk normalizer

**Text:**
25. Word/character counter + reading time
26. Case converter (UPPER, lower, Title, camelCase, snake_case)
27. Slug generator
28. Lorem ipsum generator
29. List deduper
30. Markdown table builder

**Shareable Generators:**
31. Email signature generator
32. Favicon pack generator
33. QR code generator/decoder (qrcode.js)
34. Color palette generator
35. Typography scale generator
36. Password generator + strength checker

**Accessibility:**
37. Color contrast checker (WCAG)
38. WCAG palette generator

## Workflow Chains (Link Tools Together)

- JSON Format → JSON Schema → JSON-to-CSV → CSV Column Mapper
- Meta Tags → OG Preview → Twitter Card → Schema Generator → SERP Preview
- Favicon Generator → Social Image Templates → Email Signature → QR Code

## Key Libraries (All Client-Side)

- `qrcode.js` — QR generation
- `jwt-decode` — JWT parsing (no validation)
- Web Crypto API — hash generation (built-in)
- Canvas API — image generation for QR/favicon

## Deployment

Target: Cloudflare Pages ($0/month). Not IIS.

**Domain:** Not yet registered. Use RDAP batch checking (see parent CLAUDE.md playbook). devtoolbox.com is likely taken — have alternatives ready (e.g., thisdevtool.com, devtoolkit.co, etc.).

**Deployment steps:** Follow the proven playbook in `D:\Projects\businessideas\CLAUDE.md` — same process as CalcHub (thiscalc.com).

**GA4/Cookiebot:** Already in core.js with placeholder IDs — same pattern as CalcHub. Replace when ready.

**Key difference from CalcHub:** DevToolbox uses `wrangler.toml` for deployment config. CalcHub used direct GitHub integration without wrangler.
