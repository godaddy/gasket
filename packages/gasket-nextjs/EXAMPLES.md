# @gasket/nextjs Examples

This document provides working examples for all exported functions, HOCs, and methods from the `@gasket/nextjs` package.

### `useGasketData()`

React hook that fetches GasketData from the React context.

```jsx
import { useGasketData } from '@gasket/nextjs';

export default function MyComponent() {
  const gasketData = useGasketData();

  return (
    <div>
      <h1>Environment: {gasketData.env}</h1>
      <p>API URL: {gasketData.apiUrl}</p>
    </div>
  );
}
```

### `withGasketDataProvider(gasket)`

HOC that provides Gasket data to wrapped components via React context.

```jsx
// pages/_app.js
import { withGasketDataProvider } from '@gasket/nextjs';
import gasket from '../gasket.js';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default withGasketDataProvider(gasket)(MyApp);
```

### `withLocaleInitialProps(gasket)`

HOC that injects the intl locale into component props via `getInitialProps`.

```jsx
// pages/index.js
import { withLocaleInitialProps } from '@gasket/nextjs';
import gasket from '../gasket.js';

function HomePage({ locale }) {
  return (
    <div>
      <h1>Current locale: {locale}</h1>
    </div>
  );
}

export default withLocaleInitialProps(gasket)(HomePage);
```

## Document Exports (`@gasket/nextjs/document`)

### `withGasketData(gasket, options?)`

HOC that wraps Next.js Document to inject GasketData script into the page.

```jsx
// pages/_document.js
import Document from 'next/document';
import { withGasketData } from '@gasket/nextjs/document';
import gasket from '../gasket.js';

export default withGasketData(gasket)(Document);
```

With custom options:

```jsx
// pages/_document.js
import Document from 'next/document';
import { withGasketData } from '@gasket/nextjs/document';
import gasket from '../gasket.js';

// Force script injection at index 2
export default withGasketData(gasket, { index: 2 })(Document);
```

## Layout Exports (`@gasket/nextjs/layout`)

### `withGasketData(gasket, options?)`

HOC for App Router layouts that injects GasketData script.

```jsx
// app/layout.js
import { withGasketData } from '@gasket/nextjs/layout';
import gasket from '../gasket.js';

async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

export default withGasketData(gasket)(RootLayout);
```

With custom options:

```jsx
// app/layout.js
import { withGasketData } from '@gasket/nextjs/layout';
import gasket from '../gasket.js';

async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

export default withGasketData(gasket, { index: 1 })(RootLayout);
```

## Request Exports (`@gasket/nextjs/request`)

### `request(params?)`

Function for creating GasketRequest objects in App Router server components.

```jsx
// app/page.js
import { request } from '@gasket/nextjs/request';

export default async function HomePage() {
  const req = await request();
  const userAgent = req.headers['user-agent'];

  return (
    <div>
      <p>User Agent: {userAgent}</p>
    </div>
  );
}
```

With dynamic route parameters:

```jsx
// app/blog/[slug]/page.js
import { request } from '@gasket/nextjs/request';

export default async function BlogPost({ params }) {
  const req = await request(params);
  const { slug } = req.query;

  return (
    <div>
      <h1>Blog Post: {slug}</h1>
    </div>
  );
}
```

With custom query parameters:

```jsx
// app/search/page.js
import { request } from '@gasket/nextjs/request';

export default async function SearchPage({ searchParams }) {
  const req = await request(searchParams);
  const { q } = req.query;

  return (
    <div>
      <h1>Search Results for: {q}</h1>
    </div>
  );
}
```

## Integration Examples

### Complete App Router Setup

```jsx
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginData from '@gasket/plugin-data';

export default makeGasket({
  plugins: [pluginData],
  // ... other config
});
```

```jsx
// app/layout.js
import { withGasketData } from '@gasket/nextjs/layout';
import gasket from '../gasket.js';

async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

export default withGasketData(gasket)(RootLayout);
```

### Complete Pages Router Setup

```jsx
// pages/_document.js
import Document from 'next/document';
import { withGasketData } from '@gasket/nextjs/document';
import gasket from '../gasket.js';

export default withGasketData(gasket)(Document);
```

```jsx
// pages/_app.js
import { withGasketDataProvider } from '@gasket/nextjs';
import gasket from '../gasket.js';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default withGasketDataProvider(gasket)(MyApp);
```

```jsx
// pages/index.js
import { useGasketData } from '@gasket/nextjs';
import { withLocaleInitialProps } from '@gasket/nextjs';
import gasket from '../gasket.js';

function HomePage({ locale }) {
  const gasketData = useGasketData();

  return (
    <div>
      <h1>Welcome to {gasketData.appName}</h1>
      <p>Locale: {locale}</p>
    </div>
  );
}

export default withLocaleInitialProps(gasket)(HomePage);
```
