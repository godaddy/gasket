# Web Components + React + Vite + Gasket

This app demonstrates using **vanilla Web Components** alongside React in a Gasket + Vite application.

## Why Web Components?

Web Components are **framework-agnostic**, meaning you can:
- Use the same component in React, Vue, Angular, Svelte, or vanilla JS
- Share components across multiple apps (even with different frameworks)
- Avoid framework-specific rewrites when migrating
- Build component libraries that work everywhere

## The Status Badge Component

Located at `src/components/status-badge.ts`, this is a vanilla Web Component (no Lit, no framework).

### Features
- ✅ Custom attributes: `status` and `label`
- ✅ Shadow DOM for style encapsulation
- ✅ CSS animations (pulsing indicator)
- ✅ Works with React, SSR, and hydration
- ✅ TypeScript declarations

## SSR Caveat: Client-Side Only Import

⚠️ **Web components don't work during SSR** because `HTMLElement` doesn't exist in Node.js.

You must conditionally import them:

```tsx
// ❌ This breaks SSR
import './components/status-badge';

// ✅ This works with SSR
if (typeof window !== 'undefined') {
  import('./components/status-badge');
}
```

The web component will:
1. Render as an empty tag during SSR: `<status-badge></status-badge>`
2. Upgrade and render content when JS loads in the browser

## Using Web Components in React/JSX

### 1. Create the Web Component

```typescript
// src/components/status-badge.ts
class StatusBadge extends HTMLElement {
  static get observedAttributes() {
    return ['status', 'label'];
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const status = this.getAttribute('status') || 'unknown';
    const label = this.getAttribute('label') || 'Status';
    
    this.shadowRoot!.innerHTML = `
      <style>
        /* Scoped styles that don't leak out */
      </style>
      <div class="badge">
        <span>${label}: ${status}</span>
      </div>
    `;
  }
}

customElements.define('status-badge', StatusBadge);
```

### 2. Add TypeScript Declarations

```typescript
// src/web-components.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'status-badge': {
      status?: 'success' | 'warning' | 'error' | 'info';
      label?: string;
    };
  }
}
```

This gives you **autocomplete and type safety** in JSX!

### 3. Import and Use in React

```tsx
// src/App.tsx
import './components/status-badge';  // Registers the component

function App() {
  return (
    <div>
      {/* Use like any HTML element */}
      <status-badge status="success" label="SSR"></status-badge>
      <status-badge status="info" label="React"></status-badge>
    </div>
  );
}
```

## How SSR Works with Web Components

### Server-Side (SSR)
On the server, web components render as **custom HTML tags**:

```html
<status-badge status="success" label="SSR"></status-badge>
```

The browser recognizes these as "undefined custom elements" and waits.

### Client-Side (Hydration)
When JavaScript loads, `customElements.define()` runs and the elements **upgrade**:
1. `constructor()` is called
2. `connectedCallback()` runs
3. Shadow DOM is attached
4. Styles and content are rendered

This is called **declarative shadow DOM** or **progressive enhancement**.

## Passing Data to Web Components

Web components in JSX have limitations compared to React components:

### ✅ What Works
```tsx
// Strings and numbers (passed as attributes)
<status-badge status="success" label="Active"></status-badge>

// Boolean attributes
<my-component disabled></my-component>
```

### ❌ What Doesn't Work
```tsx
// Objects/arrays don't serialize well
<my-component data={{ name: 'John' }}></my-component>  // ❌ [object Object]

// React event handlers don't work
<my-component onClick={handleClick}></my-component>  // ❌ Not a DOM event
```

### ✅ Workarounds
```tsx
// Use refs to pass complex data
const ref = useRef<any>();
useEffect(() => {
  if (ref.current) {
    ref.current.data = { name: 'John' };  // ✅ Set property directly
  }
}, []);

return <my-component ref={ref}></my-component>;

// Or use events with addEventListener
useEffect(() => {
  const handler = (e: Event) => console.log(e);
  ref.current?.addEventListener('my-event', handler);
  return () => ref.current?.removeEventListener('my-event', handler);
}, []);
```

## Web Components vs React Components

| Feature | React Component | Web Component |
|---------|-----------------|---------------|
| **Framework** | React only | Any framework |
| **State Management** | useState, Redux | Internal only |
| **Props** | Any type | Strings/numbers |
| **Events** | React synthetic events | DOM events |
| **Styles** | CSS Modules, styled-components | Shadow DOM |
| **Reusability** | Within React apps | Across all frameworks |
| **Size** | ~45KB (React runtime) | ~0KB (native browser) |
| **TypeScript** | Native support | Manual declarations |

## When to Use Web Components

### ✅ Use Web Components For:
- **Component libraries** shared across multiple apps/frameworks
- **Micro-frontends** that need framework independence
- **Third-party widgets** that customers embed
- **Design systems** used by multiple teams
- **Progressive enhancement** (work without JS)

### ❌ Use React Components For:
- **App-specific logic** that won't be reused elsewhere
- **Complex state management** (forms, dashboards)
- **Rich interactivity** (drag-and-drop, animations)
- **Tight React integration** (hooks, context, Suspense)

## Best Practices

### 1. Keep Web Components Simple
Web components work best as **presentational components**:
- Buttons, badges, icons, cards
- NOT complex forms or state-heavy components

### 2. Use Shadow DOM
Always use Shadow DOM to prevent style conflicts:
```typescript
this.attachShadow({ mode: 'open' });
```

### 3. Handle Attributes Properly
Use `observedAttributes` and `attributeChangedCallback`:
```typescript
static get observedAttributes() {
  return ['status', 'label'];
}

attributeChangedCallback(name, oldValue, newValue) {
  if (oldValue !== newValue) {
    this.render();
  }
}
```

### 4. Add TypeScript Declarations
Always create `.d.ts` files for type safety in JSX.

### 5. Register Once
Use a guard to prevent double registration:
```typescript
if (!customElements.get('my-component')) {
  customElements.define('my-component', MyComponent);
}
```

## Using Lit for Better DX

For more complex web components, use [Lit](https://lit.dev/):

```bash
npm install lit
```

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('status-badge')
export class StatusBadge extends LitElement {
  @property() status = 'unknown';
  @property() label = 'Status';

  static styles = css`
    .badge {
      padding: 8px 16px;
      border-radius: 8px;
    }
  `;

  render() {
    return html`
      <div class="badge">
        ${this.label}: ${this.status}
      </div>
    `;
  }
}
```

**Benefits of Lit:**
- ✅ Better template syntax (tagged templates)
- ✅ Reactive properties (automatic re-renders)
- ✅ TypeScript decorators
- ✅ Small size (~5KB)
- ✅ Still produces standard web components

## Vite Support

Vite has **native support** for web components:
- No special configuration needed
- Hot reload works
- TypeScript support
- Works with SSR

Just import and use them!

## Resources

- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Custom Elements v1](https://html.spec.whatwg.org/multipage/custom-elements.html)
- [Shadow DOM v1](https://dom.spec.whatwg.org/#shadow-trees)
- [Lit Framework](https://lit.dev/)
- [Web Components + React](https://custom-elements-everywhere.com/)

---

**Web components + React + Vite = Framework-agnostic power!** 🚀

