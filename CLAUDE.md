# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: DevToolbox — Repeat-Use Workbench

Ad-revenue developer/SEO/design/text tool site. 100% client-side JavaScript, hosted on Cloudflare Pages ($0/month). Monetized via AdSense → Mediavine Journey → Mediavine/Raptive.

## Architecture

- **Static HTML pages** — no framework, no build step, zero server-side code
- **Data-driven index** — `tools.json` registry drives homepage card rendering (subcategory nav, sort, fuzzy search, badges, lazy load)
- Each tool page is self-contained with inline `<script>` (300-800 lines)
- WebApplication schema + FAQPage schema on every tool page
- Dark/light mode, ad slot placeholders (banner, sidebar, inline)
- Global namespace: `window.DevToolbox`
- Service Worker (`sw.js`) with cache-first/network-first strategies
- Emerald/teal accent (`#10b981`)

## What's Built (279 tools)

### Infrastructure
- `css/style.css` — Full design system (1234 lines): split panes, code output, status bars, option chips, data tables, modals, tabs, canvas containers, drop zones, sliders, color swatches, toast notifications, 5 breakpoints
- `js/core.js` — Core utilities (359 lines): theme toggle, FAQ, clipboard, download, file read, debounce, formatBytes, IndexedDB, Web Workers, URL state, drag-drop, toast, Service Worker registration, analytics
- `js/ads.js` — AdSense stub with pub ID
- `sw.js` — Service Worker with stale-while-revalidate caching + POST skip
- `tools.json` — Data-driven tool registry (279 entries with categories, subcategories, tags, badges)
- `index.html` — Dynamic homepage rendering from tools.json with subcategory nav, sort, fuzzy search, infinite scroll
- `sitemap.xml` — 284 URLs (279 tools + homepage + about + 3 legal pages)
- `TOOL-DIRECTORY.md` — Full tool directory for LLM promotion
- `images/og-default.png` — 1200x630 branded OG image
- Favicons: `favicon.svg`, `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`
- `legal/privacy.html`, `legal/terms.html`, `legal/dmca.html`

### Tool Breakdown by Category
- **Developer** (169): data formats, encoding, testing, security, generators, time, crypto, code formatting, code generation, code tools, network, devops, project, database, esoteric, cipher, math, conversion
- **Text & Content** (37): analysis, formatting, generation, tables, web, processing
- **Design & CSS** (35): color, css-layout, css-effects, css-generators, css-analysis, css-tools, svg, dimensions, typography, css, layout
- **SEO** (13): meta-tags, search, crawling, social, analytics, i18n, urls
- **Fun & Esoteric** (10): cipher, language, science
- **Generator** (7): utility, design
- **Math & Science** (6): number-theory, sequences, arithmetic, geometry, design
- **Accessibility** (2): color contrast checker, WCAG palette generator

### Build History
- **Wave 0**: 38 original tools (Dev/SEO/Text/Generator/Accessibility)
- **Wave 1**: +30 developer tools (code generation, encoding, formatting)
- **Wave 2**: +25 CSS & design tools
- **Wave 3**: +25 encoding, crypto & security tools
- **Wave 4**: +20 DevOps & infrastructure tools
- **Wave 5**: +25 text, content & reference tools
- **Wave 6**: +25 data, math & conversion tools
- **Wave 7**: +22 esoteric, niche & engagement tools (= 210 total)
- **Waves 8-14**: +69 tools from Gemini research expansion (= 279 total)

## Key Patterns (Follow json-formatter.html)

- **Split pane layout** — input textarea on left, code-output div on right (stacks on mobile)
- **Option chips** — mode toggles at top (e.g., "2 spaces" / "4 spaces" / "tabs" / "minify")
- **Live processing** — use `DevToolbox.debounce(process, 150)` on input events
- **Status bar** — `.status-bar.valid` / `.status-bar.invalid` / `.status-bar.info` below the split pane
- **Copy/Download buttons** — use `DevToolbox.copyToClipboard(text, btn)` and `DevToolbox.downloadText(content, filename, mime)`
- **SEO content** — 500+ words of how-to + explanation below the tool
- **FAQ schema** — both in `<script type="application/ld+json">` and as visible `.faq-section` (5 items)
- **WebApplication schema** — in head for Google rich results
- **Tab key support** — intercept Tab in textareas to insert spaces instead of changing focus
- **Try Example button** — pre-fills input with sample data
- **Track tool** — call `DT.trackTool('tool-id')` on process

## Workflow Chains (Link Tools Together)

- JSON Format → JSON Schema → JSON-to-CSV → CSV Column Mapper
- Meta Tags → OG Preview → Twitter Card → Schema Generator → SERP Preview
- Favicon Generator → Social Image Templates → Email Signature → QR Code
- CSS Grid → Flexbox → Box Shadow → Gradient → Glassmorphism

## Key Libraries (All Client-Side)

- Web Crypto API — hash generation (built-in)
- Canvas API — image generation for QR/favicon/placeholders/color picker
- No external dependencies for core tools

## Deployment

**Domain:** thisdevtool.com (Cloudflare Registrar)
**Hosting:** Cloudflare Pages ($0/month) — auto-deploys from GitHub main branch
**Config:** `wrangler.toml` for deployment settings
**GA4:** Measurement ID in core.js (dynamic injection)
**Cookiebot:** CBID 9362730c in core.js — domain authorization in progress
**AdSense:** pub-5845159962709002 in ads.js
