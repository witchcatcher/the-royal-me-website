---
title: Configure CSP Headers for Static Site with Third-Party Widgets
category: security-issues
tags:
  - CSP
  - Cloudflare Pages
  - Bandsintown
  - third-party-widgets
  - JSONP
  - static-site
components:
  - _headers
  - index.html
  - script.js
  - Cloudflare Pages
symptoms:
  - Blocked JSONP script requests from rest.bandsintown.com
  - Blocked iframe loads from widget.bandsintown.com
  - Blocked Cloudflare analytics beacon (static.cloudflareinsights.com)
  - Widget fails silently without proper CSP directives
severity: medium
frequency: one-time-configuration
date_solved: 2026-02-20
---

# Configure CSP Headers for Static Site with Third-Party Widgets

## Problem Statement

Setting up Content Security Policy (CSP) headers for a static band website (The Royal Me) hosted on Cloudflare Pages. The site uses multiple third-party widgets: Bandsintown (shows), Spotify, Bandcamp, YouTube (all iframe embeds), and Google Fonts. The initial CSP policy blocked legitimate resources because third-party widgets load resources in unexpected ways.

## Root Cause

Three implementation details were not obvious from vendor documentation:

1. **Bandsintown uses JSONP, not fetch.** The widget dynamically creates `<script>` tags pointing to `rest.bandsintown.com/V3.1/artists/.../events/?callback=bitJsonp_...`. JSONP requires `script-src`, not `connect-src`, because the browser executes a script from that domain.

2. **Bandsintown renders in an iframe.** The widget injects an iframe from `widget.bandsintown.com/widget_iframe.html`, requiring a `frame-src` entry.

3. **Cloudflare Pages auto-injects analytics.** Every page gets `static.cloudflareinsights.com/beacon.min.js` injected automatically. This isn't in your HTML source but must be whitelisted.

## Solution

### Step 1: Start with report-only CSP

Create `_headers` in project root with `Content-Security-Policy-Report-Only`:

```
/*
  Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' https://widget.bandsintown.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; frame-src https://open.spotify.com https://bandcamp.com https://www.youtube.com; img-src 'self' data: https:; connect-src 'self'
```

### Step 2: Deploy and check browser console

Push to main (Cloudflare auto-deploys), wait 1-2 minutes, hard-refresh (Cmd+Shift+R), open DevTools Console. Look for purple/yellow CSP violation messages.

### Step 3: Add missing domains to correct directives

Map each violation to the right directive:

| Violation | Directive | Why |
|-----------|-----------|-----|
| `rest.bandsintown.com` script blocked | `script-src` | JSONP = script tags, not fetch |
| `widget.bandsintown.com` frame blocked | `frame-src` | Widget renders in iframe |
| `static.cloudflareinsights.com` script blocked | `script-src` | Cloudflare auto-injects beacon |

### Step 4: Switch to enforcing

Final `_headers`:

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' https://widget.bandsintown.com https://rest.bandsintown.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; frame-src https://open.spotify.com https://bandcamp.com https://www.youtube.com https://widget.bandsintown.com; img-src 'self' data: https:; connect-src 'self' https://static.cloudflareinsights.com
```

## Key Insight: JSONP vs Fetch

| Loading Pattern | CSP Directive | Examples |
|-----------------|---------------|----------|
| External `<script>` tag | `script-src` | Google Analytics, widget loaders |
| JSONP API calls | `script-src` | Bandsintown events API |
| `<iframe>` embeds | `frame-src` | YouTube, Spotify, Bandcamp |
| `fetch()` / XHR | `connect-src` | REST APIs, analytics beacons |
| Web fonts | `font-src` | Google Fonts (`fonts.gstatic.com`) |
| External stylesheets | `style-src` | Google Fonts (`fonts.googleapis.com`) |

JSONP is the gotcha: it looks like an API call but it's actually a dynamically created script tag. Always check the Network tab to see if requests are `script` type or `xhr`/`fetch` type.

## Prevention

When adding a new third-party widget to a static site:

1. **Check how it loads resources** -- script tags, iframes, fetch, or JSONP?
2. **Always start with `Content-Security-Policy-Report-Only`** -- never go straight to enforcing
3. **Test on deployed Cloudflare Pages, not localhost** -- Cloudflare injects its own scripts
4. **Wait for deploy propagation** -- CSP headers cache; hard-refresh after deploy
5. **Use `async` on all third-party scripts** -- prevents blocking site JS if widget CDN is slow

## Related Files

- `/Users/ford/the-royal-website/_headers` -- the CSP policy
- `/Users/ford/circuit-breaker-records-website/_headers` -- sister site's CSP (tighter, no third-party scripts)
- [Stale deployment docs solution](../integration-issues/../../circuit-breaker-records-website/docs/solutions/integration-issues/stale-deployment-docs-cloudflare-pages.md) -- Cloudflare Pages deployment verification
