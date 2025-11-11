# UXP Integration with Vite SSR

This document explains how UXP (Presentation Central) headers and footers are integrated with Gasket + Vite using Server-Side Rendering.

## Overview

Vite's SSR architecture only controls content inside `<div id="root">`, so we use Express middleware to inject UXP headers/footers at the body level (outside the root div). This provides the same functionality as Next.js's `_document.tsx` but adapted for Vite's architecture.

## Architecture

The integration consists of 3 key files:

### 1. `uxp-vite-integration.ts`
Custom Gasket plugin that:
- Fetches Presentation Central data on each request
- Normalizes v3 API responses to v2 format (if needed)
- Intercepts HTML responses via Express middleware
- Injects headers, footers, and CSS at the correct body-level locations

### 2. `normalize-manifest.ts`
Utility functions that:
- Convert PC v3 API responses to v2 format
- Handle both API versions transparently
- Adapted from `@godaddy/gasket-next` for consistency

### 3. `gasket.ts`
Gasket configuration with UXP plugin:
```typescript
export default makeGasket({
  plugins: [
    pluginVisitor,        // Provides visitor info (plid, market, etc.)
    pluginUxp,            // Adds UX Platform support (PC & UXCore2)
    uxpViteIntegration,   // Integrates UXP headers with Vite SSR
    pluginVite            // Vite dev/build support
  ],
  
  presentationCentral: {
    version: '3.0',  // v3 is recommended (v2 also supported)
    params: {
      app: 'test-vite-app',
      manifest: 'internal-header',
      deferjs: true
    }
  }
});
```

## How It Works

### Step 1: Fetch PC Data (Middleware)
On every request, the middleware fetches Presentation Central data:

```typescript
app.use(async (req, res, next) => {
  // Fetch PC data for this request (uses cookies for plid, market, etc.)
  const pcContent = await gasket.actions.getPresentationCentral(req);
  
  // Normalize v3 → v2 if needed (v3 has 'components' structure)
  if ('components' in pcContent.data) {
    pcContent.data = normalizeManifest(pcContent.data);
  }
  
  // Store on request for later use
  req.pcContent = pcContent;
  next();
});
```

### Step 2: Vite Renders React App
Vite's SSR renders your React app to HTML (inside `<div id="root">`):

```tsx
// entry-server.tsx
export async function render(url: string, context: any) {
  const html = ReactDOMServer.renderToString(<App />);
  return html; // This goes inside <div id="root">
}
```

### Step 3: Inject UXP Content (Middleware)
After Vite renders, middleware injects headers/footers into the final HTML:

```typescript
app.use((req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    let html = body.toString();
    const { data } = req.pcContent;
    
    // Inject CSS in <head>
    html = html.replace('</head>', `${data.assets.css}\n</head>`);
    
    // Inject header after <body> (outside root!)
    html = html.replace(/(<body[^>]*>)/i, 
      `$1\n<div id="uxp-header">${data.header}</div>`
    );
    
    // Inject footer before </body> (outside root!)
    html = html.replace('</body>', 
      `<div id="uxp-footer">${data.footer}</div>\n${data.assets.js}\n</body>`
    );
    
    return originalSend.call(this, html);
  };
  
  next();
});
```

## Final HTML Structure

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Vite assets -->
    <script type="module" src="/@vite/client"></script>
    
    <!-- UXP CSS (injected by middleware) -->
    <style>/* UXP styles */</style>
    <link rel="stylesheet" href="...application-header.css"/>
  </head>
  <body>
    <!-- UXP Header (injected by middleware) -->
    <div id="uxp-header">
      <header class="manifest">
        <nav><!-- GoDaddy logo, navigation, etc. --></nav>
      </header>
    </div>
    
    <!-- Your Vite App (rendered by entry-server.tsx) -->
    <div id="root">
      <App />
    </div>
    
    <!-- UXP Footer (injected by middleware) -->
    <div id="uxp-footer">
      <footer><!-- Copyright, privacy links, etc. --></footer>
    </div>
    
    <!-- UXP Scripts (injected by middleware) -->
    <script>/* UXP globals, loaders, etc. */</script>
  </body>
</html>
```

## Why String Manipulation is Actually Correct

You might think string manipulation is "hacky" compared to React components, but **it's actually the right approach for Vite**:

**The Vite Constraint:**
```html
<!-- index.html template -->
<body>
  <div id="root"><!--app-html--></div>
</body>
```

Vite's `entry-server.tsx` only controls what goes inside `<!--app-html-->`:
- ✅ You CAN render your app as React components
- ❌ You CANNOT inject at body level from entry-server

**Why React Components Don't Work:**
If we render headers/footers in entry-server:
```tsx
// This puts everything INSIDE <div id="root">!
return ReactDOMServer.renderToString(
  <>
    <Header />  {/* ❌ Wrong location */}
    <App />
    <Footer />  {/* ❌ Wrong location */}
  </>
);
```

Result:
```html
<body>
  <div id="root">
    <!-- Everything is stuck inside here! -->
    <div id="uxp-header">...</div>
    <App />
    <div id="uxp-footer">...</div>
  </div>
</body>
```

**Why String Manipulation is Correct:**
To inject at body level (outside root div), we must intercept the final HTML:

```typescript
// ✅ CORRECT: Inject at body level via middleware
html = html.replace(/(<body[^>]*>)/i, `$1\n<div id="uxp-header">...</div>`);
```

Result:
```html
<body>
  <div id="uxp-header">...</div>  {/* ✅ Outside root! */}
  <div id="root"><App /></div>
  <div id="uxp-footer">...</div>  {/* ✅ Outside root! */}
</body>
```

## Presentation Central API Version Support

This integration supports **both v2 and v3 transparently**:

### Version 3.0 (Recommended)
```typescript
presentationCentral: {
  version: '3.0',
  params: {
    manifest: 'internal-header',  // Use 'manifest'
    deferjs: true                  // ✅ Supports defer
  }
}
```

**V3 Response Structure:**
- Nested `components.header` and `components.footer`
- Arrays of objects for CSS/JS assets
- Split `config` object (setup, hcs, tealium)
- Automatically normalized to v2 format for rendering

### Version 2.0 (Legacy)
```typescript
presentationCentral: {
  version: '2.0',
  params: {
    header: 'internal-header'  // Use 'header'
  }
}
```

**V2 Response Structure:**
- Flat `header` and `footer` strings
- HTML strings for all assets
- Used directly without normalization

### How Normalization Works

The `normalizeManifest()` function (adapted from gasket-next) transforms v3 → v2:

```typescript
// V3 response
{
  components: { header: '...', footer: '...' },
  config: { setup: '...', hcs: '...' },
  css: [{...}],  // Array of objects
}

// ↓ Normalized to v2 ↓

// V2 format (used for rendering)
{
  header: '...',
  footer: '...',
  globals: '<script>...</script>',
  assets: { css: '<link.../>', js: '<script.../>' }
}
```

Your code always works with v2 format internally, regardless of which API version is configured!

## Benefits of SSR Approach

✅ **No Flash of Unstyled Content (FOUC)** - Headers appear immediately
✅ **Better SEO** - Headers in initial HTML for search engines
✅ **Faster perceived load** - Everything renders together
✅ **Works without JavaScript** - Progressive enhancement
✅ **Dynamic per-request** - Headers update based on cookies (market, plid, etc.)

## Testing

Start the dev server:
```bash
cd test-vite-app
pnpm run local
```

Open in browser:
```
http://localhost:3000?plid=1
```

To see different branding, change the PLID:
- `?plid=1` - GoDaddy brand
- `?plid=3153` - No brand (default)

To test different languages, set a market cookie:
```javascript
document.cookie = "market=fr-FR";
// Reload page to see French headers
```

## Debugging

Check visitor info via API:
```bash
curl http://localhost:3000/api/visitor | jq
```

View page source to see SSR headers:
```bash
curl http://localhost:3000?plid=1 | grep "uxp-header"
```

Enable debug mode in gasket config:
```typescript
visitor: {
  debug: true  // Shows how plid/market were derived
}
```

## Comparison with Next.js

| Feature | Next.js | Vite (This App) |
|---------|---------|-----------------|
| Header injection | `_document.tsx` | Express middleware |
| Control level | Full HTML document | Intercept final HTML |
| Approach | React components | String manipulation |
| Flexibility | Very flexible | Limited by Vite's design |
| Performance | Same | Same |
| Result | Same final HTML | Same final HTML |

**Bottom Line:** While the approaches differ, both achieve the same goal of server-rendered headers/footers with no FOUC and good SEO.
