# Web Component SSR Fix

## The Problem

When running the app with SSR, you got this error:
```
[@gasket/plugin-vite] SSR error: ReferenceError: HTMLElement is not defined
    at /Users/jordanpina/dev/gasket-os/gasket/test-vite-app/src/components/status-badge.ts:14:5
```

## Why This Happens

Web components use browser-only APIs like `HTMLElement`. During SSR:
- Code runs in **Node.js** (not a browser)
- Node.js doesn't have `HTMLElement`, `customElements`, or Shadow DOM
- When `entry-server.tsx` imports `App.tsx`, which imports `status-badge.ts`, the class definition fails

## The Solution

**Import web components conditionally** - only in the browser:

### ❌ Before (Broken)
```tsx
// src/App.tsx
import './components/status-badge';  // Runs during SSR = crash!
```

### ✅ After (Fixed)
```tsx
// src/App.tsx
// Only import on client side
if (typeof window !== 'undefined') {
  import('./components/status-badge');
}
```

## How It Works Now

### Server-Side (SSR)
1. `entry-server.tsx` runs in Node.js
2. Web component import is **skipped** (`window` is undefined)
3. JSX renders web component tags as empty HTML:
   ```html
   <status-badge status="success" label="SSR"></status-badge>
   ```
4. Server sends this HTML to the browser

### Client-Side (Hydration)
1. Browser receives HTML with empty `<status-badge>` tags
2. `entry-client.tsx` runs
3. Web component import **executes** (`window` exists)
4. `customElements.define()` registers the component
5. Browser "upgrades" the empty tags to interactive components
6. Content appears with styles and animations

## Visual Timeline

```
Server (Node.js):
  ❌ Skip: import('./components/status-badge')
  ✅ Render: <status-badge></status-badge> (empty shell)

↓ HTML sent to browser

Browser:
  ✅ Run: import('./components/status-badge')
  ✅ Register: customElements.define('status-badge', StatusBadge)
  ✅ Upgrade: <status-badge> → Full component with Shadow DOM
```

## Trade-offs

### What You Get
- ✅ SSR works without crashing
- ✅ Web components still function in the browser
- ✅ Framework-agnostic components

### What You Lose
- ⚠️ Web components are **empty during SSR** (content appears after JS loads)
- ⚠️ Brief flash of unstyled content (FOUC)
- ⚠️ SEO crawlers may not see web component content

## Alternative Solutions

### Option 1: Declarative Shadow DOM (Future)
Not widely supported yet, but would allow SSR:
```html
<status-badge>
  <template shadowroot="open">
    <style>...</style>
    <div>Content</div>
  </template>
</status-badge>
```

### Option 2: Use React Components for Critical Content
For above-the-fold content, use React components (fully SSR'd):
```tsx
// ✅ Fully SSR'd
<div className="badge">{status}</div>

// ⚠️ Shell only during SSR
<status-badge status={status}></status-badge>
```

### Option 3: Lit SSR
[Lit has experimental SSR support](https://lit.dev/docs/ssr/overview/) but requires special setup.

## Best Practice

**Use web components for:**
- Non-critical UI (badges, icons, decorations)
- Progressive enhancement scenarios
- Shared component libraries

**Use React components for:**
- Critical above-the-fold content
- SEO-important content
- Core app functionality

## Testing the Fix

Run the app:
```bash
npm run local
```

Visit http://localhost:3000

**What you should see:**
1. Page loads with server-rendered content (React components)
2. Web component shells are in the HTML
3. After ~100ms, web components "pop in" with their full styling
4. No errors in the console!

**View page source:**
```html
<!-- You'll see empty web component tags -->
<status-badge status="success" label="SSR"></status-badge>
<!-- But React content is fully rendered -->
<h1>Welcome to Gasket + Vite!</h1>
<div>Server rendered data...</div>
```

---

**Summary:** Web components need a client-side only import to work with SSR. They render as empty shells on the server and upgrade in the browser.

