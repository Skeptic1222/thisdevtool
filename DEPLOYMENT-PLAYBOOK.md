# ThisDevTool — Deployment Playbook

Proven step-by-step process for taking ThisDevTool from local development to live production. Based on the ThisCalc (thiscalc.com) deployment completed 2026-03-22.

## Phase 1: Domain Registration

### Check Domain Availability (RDAP API)

The RDAP API is the only reliable way to check .com availability. DNS lookups and HTTP probes give false results.

```bash
# Check a single domain (404 = available, 200 = taken)
curl -s -o /dev/null -w "%{http_code}" "https://rdap.verisign.com/com/v1/domain/DOMAINNAME.com"

# Batch check 20 domains at once
for domain in devtoolkit.com thisdevtool.com devtoolhq.com mydevtools.com devtoolbox.co devtoolsuite.com codetools.co devtoolhub.co toolboxdev.com devtoolsnow.com freetoolbox.com thisdevbox.com gotoolbox.com justdevtools.com devtoolzone.com devtoolspot.com codetoolbox.co devtoolcraft.com devtoolpro.co anytool.co; do
  resp=$(curl -s -o /dev/null -w "%{http_code}" "https://rdap.verisign.com/com/v1/domain/$domain" 2>/dev/null)
  if [ "$resp" = "404" ]; then
    echo "AVAILABLE: $domain"
  elif [ "$resp" = "200" ]; then
    echo "TAKEN:     $domain"
  else
    echo "UNKNOWN:   $domain (HTTP $resp)"
  fi
done
```

**Important:** Most obvious names are taken. Have 20+ alternatives ready. Prioritize:
1. .com domains (~$10/yr) — best for SEO and trust
2. Short, 2-word combinations humans can remember
3. Words that describe the site's purpose

### Register on Cloudflare

1. Go to [domains.cloudflare.com](https://domains.cloudflare.com)
2. Search the available domain from RDAP check
3. Purchase (~$10.46/yr for .com, at-cost pricing)
4. Domain automatically gets Cloudflare DNS + CDN + SSL

## Phase 2: GA4 Analytics

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create property: name = "ThisDevTool", timezone = Eastern, currency = USD
3. Business objectives: "Understand web/app traffic" + "View user engagement"
4. Choose "Web" platform → enter your domain → stream name "ThisDevTool Web"
5. Copy the Measurement ID (G-XXXXXXXXXX)
6. Update `js/core.js` — replace the GA_ID placeholder with your real ID

**Note:** GA4 property can be created before the domain is live. Tag detection will fail during setup but that's OK.

## Phase 3: GitHub + Cloudflare Pages

### Push to GitHub
```bash
cd D:/Projects/businessideas/devtoolbox
git init
git branch -M main
git add .
git commit -m "Initial release: ThisDevTool with [N] developer tools"
# Create repo via MCP tool: mcp__github__create_repository({ name: "devtoolbox-or-chosen-name" })
git remote add origin https://github.com/Skeptic1222/REPO_NAME.git
git push -u origin main
```

### Deploy to Cloudflare Pages

1. In Cloudflare dashboard: **Build → Workers & Pages**
2. Click **Create application**
3. **IMPORTANT:** Click **"Looking to deploy Pages? Get started"** — do NOT use the Workers flow
4. Select your repo
5. Settings:
   - Project name: match your domain
   - Production branch: `main`
   - Build command: leave EMPTY
   - Build output directory: `/`
6. Click **Save and Deploy**

### Connect Custom Domain

1. After deployment: go to project → **Custom domains** tab
2. Click **Set up a custom domain**
3. Type your domain (e.g., `yourdomain.com`)
4. Click **Continue** → **Activate domain**
5. DNS auto-configures since domain is already on Cloudflare
6. Active within 1-5 minutes

## Phase 4: Cookie Consent (Before Ad Networks)

1. Sign up at [cookiebot.com](https://www.cookiebot.com) (free plan, up to 100 pages)
2. Add your domain
3. Copy the CBID (UUID format)
4. Update `js/core.js` — replace the COOKIEBOT_ID placeholder

## Phase 5: Ad Network Application

**Ladder (apply in order as traffic grows):**
1. **Google AdSense** — no minimum traffic, apply immediately at [adsense.google.com](https://adsense.google.com)
2. **Newor Elevate** — no minimum, good for low-traffic sites
3. **Mediavine Journey** — requires 1K sessions/month
4. **Mediavine** — requires $5K annual revenue
5. **Raptive** — requires 25K pageviews/month

## Common Pitfalls (Learned from ThisCalc)

| Problem | Solution |
|---------|----------|
| `npx serve -s` redirects all routes to index.html | Use `python -m http.server PORT` for static sites |
| `gh` CLI not in PATH | Use MCP GitHub tools (mcp__github__create_repository) |
| Cloudflare "Create application" defaults to Workers | Look for "Looking to deploy Pages?" link |
| Domain names all taken | Batch RDAP check 20+ alternatives at once |
| GA4 "tag not detected" warning | Normal — site isn't live yet. Click Done. |
| nslookup returns local LAN IPs | Local DNS interferes. Use RDAP API instead. |
| whois command not available | Not installed on this machine. Use RDAP API. |

## Verification Checklist

After deployment, verify with Playwright (mobile 390x844 first):
- [ ] All pages return HTTP 200
- [ ] Zero console JS errors
- [ ] Calculator/tool logic works (inputs produce correct outputs)
- [ ] Share URLs populate correctly
- [ ] Dark mode toggle works
- [ ] Footer links all resolve (no 404s)
- [ ] sitemap.xml accessible
- [ ] robots.txt accessible
