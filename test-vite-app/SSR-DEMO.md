# SSR Demo - Gasket + Vite

This app demonstrates **Server-Side Rendering (SSR)** with Vite and Gasket.

## How It Works

The `@gasket/plugin-vite` automatically detects the presence of `src/entry-server.tsx` and enables SSR mode.

### Key Files

1. **`src/entry-server.tsx`** - Server-side rendering logic
   - Exports `render()` function that renders React to HTML
   - Exports `enableSSR()` function to control SSR per-route (optional)
   - Passes server data to the app (timestamp, URL, user-agent)

2. **`src/entry-client.tsx`** - Client-side hydration
   - Uses `hydrateRoot()` instead of `createRoot()` to hydrate server-rendered HTML
   - Preserves server-rendered markup for faster initial load

3. **`src/App.tsx`** - React component
   - Accepts `serverData` prop containing server-rendered data
   - Displays SSR data in green box (rendered on server)
   - Displays visitor data in blue box (fetched client-side)

4. **`index.html`** - HTML template
   - Contains `<!--app-html-->` placeholder where SSR content is injected
   - Script points to `entry-client.tsx` for hydration

## Running the App

### Development (with SSR + HMR)
```bash
npm run local
```

Visit http://localhost:3000

**What happens:**
- Vite plugin detects `entry-server.tsx`
- Each request renders on the server
- HTML is sent with server data embedded
- Client hydrates the markup
- HMR updates work instantly (<100ms)

### Production
```bash
npm run build    # Builds client + server bundles
npm run preview  # Runs production server with SSR
```

## Verifying SSR Works

### 1. View Page Source
Right-click → "View Page Source" and you should see:

```html
<div id="root">
  <script>window.__SERVER_DATA__={"timestamp":"2024-11-07T..."}</script>
  <div style="text-align:center">
    <h1>Welcome to Gasket + Vite!</h1>
    <div style="...background:#f0fdf4...">
      <h3>🚀 Server-Side Rendered Data</h3>
      ...
    </div>
  </div>
</div>
```

**If you see this HTML content in the source, SSR is working!** ✅

### 2. Disable JavaScript
1. Open DevTools → Settings → Debugger → "Disable JavaScript"
2. Refresh the page
3. You should still see the server-rendered content (no blank page)

### 3. Check Network Tab
1. Open DevTools → Network tab
2. Refresh the page
3. Click on the document request (first one)
4. Look at the "Response" tab - you'll see full HTML with content

## SSR vs SPA Comparison

| Feature | SPA (main.tsx) | SSR (entry-server.tsx) |
|---------|----------------|------------------------|
| **Initial HTML** | Empty `<div id="root"></div>` | Full content in HTML |
| **Time to Content** | ~500ms (JS parse + render) | ~50ms (already rendered) |
| **SEO** | Limited (requires JS) | Full (crawlers see content) |
| **Data Fetching** | Client-side only | Server + client |
| **HMR** | ✅ Works | ✅ Works (even for SSR code!) |

## Per-Route SSR Control

You can mix SSR and SPA per-route using the `enableSSR()` function:

```typescript
// src/entry-server.tsx
export function enableSSR(url: string, context: any) {
  // SSR for marketing pages
  if (url.startsWith('/marketing')) return true;
  
  // SPA for app routes
  if (url.startsWith('/app')) return false;
  
  // SSR by default
  return true;
}
```

## Benefits of Vite SSR

- ✅ **HMR for SSR code** - Edit `entry-server.tsx` and see changes instantly
- ✅ **Flexible** - Mix SSR and SPA per-route
- ✅ **Fast** - No full server restart needed
- ✅ **Simple** - Just add `entry-server.tsx` and it works
- ✅ **Gasket Integration** - Access `req`, `res`, Gasket actions

## Gasket Features Still Work

- ✅ **Visitor Plugin** - Fetch visitor data via `/api/visitor`
- ✅ **Authentication** - Can add auth checks in SSR
- ✅ **Logging** - Server logs work as usual
- ✅ **API Routes** - All Gasket APIs available

## Web Components Work Too! 🎨

This demo also includes **vanilla Web Components** to show they work seamlessly with React and SSR:

**`src/components/status-badge.ts`** - A custom `<status-badge>` element

### Using Web Components in JSX

```tsx
// 1. Import to register the component (client-side only!)
if (typeof window !== 'undefined') {
  import('./components/status-badge');
}

// 2. Use it like any HTML element
function App() {
  return (
    <div>
      <status-badge status="success" label="SSR"></status-badge>
      <status-badge status="info" label="React"></status-badge>
    </div>
  );
}
```

### Benefits
- ✅ **Framework-agnostic** - Same component works in React, Vue, vanilla JS
- ✅ **Encapsulated** - Shadow DOM prevents style conflicts
- ✅ **Reusable** - Share components across different apps/frameworks
- ✅ **Works with SSR** - Renders on server, hydrates on client
- ✅ **TypeScript support** - Add types with `.d.ts` files

### SSR Behavior

⚠️ **Important:** Web components only render the **shell** during SSR:

**Server HTML:**
```html
<status-badge status="success" label="SSR"></status-badge>
<!-- Empty tag, no content yet -->
```

**After client JS loads:**
```html
<status-badge status="success" label="SSR">
  #shadow-root
    <style>...</style>
    <div class="badge">...</div>  <!-- Content appears here -->
</status-badge>
```

The web component "upgrades" when JavaScript loads, making it interactive. There will be a brief flash before content appears.

## Going Further

### Add React Router
```bash
npm install react-router-dom
```

Then use SSR with routing:
```typescript
// entry-server.tsx
import { StaticRouter } from 'react-router-dom/server';

export function render(url: string) {
  return ReactDOMServer.renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );
}
```

### Add Data Fetching
```typescript
// entry-server.tsx
export async function render(url: string) {
  const data = await fetch('https://api.example.com/data');
  return renderToString(<App data={data} />);
}
```

### Deploy
Same as SPA - just run `npm run build` and deploy the `dist/` folder + server!

---

**This is a working example of Vite SSR with Gasket!** 🚀

