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

## What's Built (93 tools)

### Infrastructure
- `css/style.css` — Full design system (1200+ lines): split panes, code output, status bars, option chips, data tables, modals, tabs, canvas containers, drop zones, sliders, color swatches, toast notifications, 5 breakpoints
- `js/core.js` — Core utilities (358 lines): theme toggle, FAQ, clipboard, download, file read, debounce, formatBytes, IndexedDB, Web Workers, URL state, drag-drop, toast, Service Worker registration, analytics
- `js/ads.js` — AdSense stub with pub ID
- `sw.js` — Service Worker for offline caching
- `tools.json` — Data-driven tool registry (93 entries with categories, subcategories, tags, badges)
- `index.html` — Dynamic homepage rendering from tools.json with subcategory nav, sort, search
- `sitemap.xml` — 98 URLs (93 tools + homepage + about + 3 legal pages)
- `images/og-default.png` — 1200x630 branded OG image
- Favicons: `favicon.svg`, `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`
- `legal/privacy.html`, `legal/terms.html`, `legal/dmca.html`

### Original 38 Tools (Dev/SEO/Text/Generator/Accessibility)
JSON formatter, Base64, regex tester, JWT decoder, UUID generator, cron parser, hash generator, diff checker, timestamp converter, CSV↔JSON, SQL formatter, markdown preview, HTML↔Markdown, YAML↔JSON, .env redactor, meta tag generator, schema JSON-LD generator, SERP preview, robots.txt generator, OG/Twitter card preview, UTM builder, canonical checker, hreflang builder, slug normalizer, word counter, case converter, slug generator, lorem ipsum, list deduper, markdown table builder, email signature, favicon generator, QR code, color palette, typography scale, password generator, color contrast checker, WCAG palette generator

### Wave 1: 30 Developer Tools (code generation, encoding, formatting, generators)
JSON-to-TypeScript/Go/Python/C#/Java/Rust, JSON Schema generator, JSONPath evaluator, XML↔JSON, TOML↔JSON, URL encoder, HTML entity encoder, hex↔ASCII, binary↔text, number base converter, CSS/JS/HTML minifier, XML formatter, chmod calculator, string escape, indent converter, code line counter, cURL-to-code, regex-to-english, .gitignore builder, fake data generator, ASCII art generator, Unicode text generator, barcode generator

### Wave 2: 25 CSS & Design Tools
CSS Grid generator, Flexbox playground, box shadow editor, text shadow editor, gradient generator, border radius editor, transform playground, animation builder, filter playground, clip-path editor, glassmorphism generator, neumorphism generator, easing/bezier visualizer, specificity calculator, unit converter, Tailwind-to-CSS, SVG optimizer, SVG-to-CSS, SVG path editor, image color picker, aspect ratio calculator, font pairing suggester, placeholder image generator, responsive tester, color converter

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

## Remaining Waves (see plan: staged-gathering-acorn.md)

- Wave 3: 25 Encoding, Crypto & Security tools
- Wave 4: 20 DevOps & Infrastructure tools
- Wave 5: 25 Text, Content & Reference tools
- Wave 6: 25 Data, Math & Conversion tools
- Wave 7: 22 Esoteric, Niche & Engagement tools
- Post-Wave: Cross-linking pass, Lighthouse audit, sitemap refresh

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
