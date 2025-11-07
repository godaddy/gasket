/**
 * TypeScript declarations for custom web components
 * This tells TypeScript about our custom elements in JSX
 */

declare namespace JSX {
  interface IntrinsicElements {
    'status-badge': {
      status?: 'success' | 'warning' | 'error' | 'info' | 'unknown';
      label?: string;
    };
  }
}

