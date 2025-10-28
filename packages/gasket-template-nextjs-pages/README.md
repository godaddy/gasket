# Gasket Next.js Pages Template

A modern TypeScript web application template built with Gasket, Next.js Pages Router, HTTPS proxy, and internationalization support.

## Overview

This template provides a production-ready starting point for building web applications using:

- **Next.js 15** with Pages Router - React framework with file-based routing
- **HTTPS Proxy** - Secure development environment with proxy server
- **TypeScript** - Type-safe development with modern JavaScript features
- **Gasket** - Plugin architecture for extensible applications
- **React Intl** - Internationalization with multi-language support
- **Vitest** - Lightning-fast unit testing with React Testing Library

## Features

- ✅ **Next.js Pages Router** with TypeScript support
- ✅ **HTTPS development proxy** for secure local testing
- ✅ **Internationalization** pre-configured with English and French
- ✅ **Server-side rendering** with Gasket data injection
- ✅ **API routes** support via Next.js API directory
- ✅ **Testing setup** with Vitest, React Testing Library, and JSDOM
- ✅ **ESLint configuration** with React and Next.js rules
- ✅ **Development tools** with hot reloading and TypeScript watching
- ✅ **Production build** optimization

## Quick Start

Create a new Next.js Pages Router project:

```bash
npx create-gasket-app@latest my-app --template @gasket/template-nextjs-pages
```

## Project Structure

```
my-app/
├── pages/                 # Next.js Pages Router
│   ├── _app.tsx           # App component wrapper
│   ├── _document.ts       # Document component
│   └── index.tsx          # Home page component
├── components/            # React components
│   └── head.tsx           # Reusable head component
├── locales/               # Internationalization files
│   ├── en-US.json         # English translations
│   └── fr-FR.json         # French translations
├── test/                  # Test files
├── gasket.ts              # Gasket configuration
├── server.ts              # HTTPS proxy server
├── intl.ts                # Internationalization manager
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── dist/                  # Built server files
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run local` | Start development with HTTPS proxy, TypeScript watch, and Next.js dev server |
| `npm run build` | Build TypeScript proxy server and Next.js application |
| `npm run start` | Start production servers (HTTPS proxy + Next.js) |
| `npm run preview` | Build and start production servers |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run docs` | Generate and serve documentation |
| `npm run lint` | Check code style and quality |

## Development

### HTTPS Development Proxy

The template includes an HTTPS proxy server that runs alongside Next.js during development:

- **HTTPS Proxy**: `https://localhost:80`
- **Next.js Dev Server**: `http://localhost:3000`
- **Proxy Target**: Routes HTTPS traffic to the Next.js dev server

This allows you to:
- **Test HTTPS features** locally (secure cookies, service workers, etc.)
- **Simulate production environment** with secure connections
- **Debug SSL/TLS issues** during development
- **Test PWA features** that require HTTPS

### Development Setup

Three concurrent processes run during development:
1. **TypeScript Watch** - Compiles server TypeScript files on change
2. **HTTPS Proxy Server** - Provides secure development environment
3. **Next.js Dev Server** - Hot reloads React components and pages

### Pages Router Architecture

This template uses Next.js Pages Router, which provides:

- **File-based routing** in the `pages/` directory
- **`_app.tsx`** for global app wrapper and providers
- **`_document.ts`** for HTML document structure
- **Data fetching** with `getServerSideProps`, `getStaticProps`, and `getInitialProps`
- **API routes** in `pages/api/` directory
- **Automatic code splitting** per page

## Internationalization

The template includes full i18n support with React Intl and `@gasket/react-intl`.

## Pages and Components

### App Component (`pages/_app.tsx`)

The app component wraps all pages and includes:
- **IntlProvider** for internationalization
- **Router-based locale detection**
- **Global providers** and context

### Document Component (`pages/_document.ts`)

Enhanced with Gasket data injection using `withGasketData`:

```tsx
import Document from 'next/document';
import { withGasketData } from '@gasket/nextjs/document';
import gasket from '@/gasket';

export default withGasketData(gasket)(Document);
```

### Adding New Pages

Create new pages in the `pages/` directory:

```tsx
// pages/about.tsx
import Head from '../components/head';
import { FormattedMessage } from 'react-intl';

export default function AboutPage() {
  return (
    <div>
      <Head title="About" description="About our app" />
      <h1><FormattedMessage id="about_title" /></h1>
    </div>
  );
}
```

### API Routes

Add API routes in `pages/api/`:

```tsx
// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({ users: [] });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

### Data Fetching

Use Next.js data fetching methods:

```tsx
// Server-side rendering
export async function getServerSideProps() {
  const data = await fetchData();
  return { props: { data } };
}

// Static generation
export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data }, revalidate: 60 };
}

// Client-side only
export async function getInitialProps() {
  const data = await fetchData();
  return { data };
}
```

## Configuration

The template includes these Gasket plugins by default:

- `@gasket/plugin-nextjs` - Next.js integration
- `@gasket/plugin-https-proxy` - HTTPS development proxy
- `@gasket/plugin-intl` - Internationalization support
- `@gasket/plugin-webpack` - Webpack configuration
- `@gasket/plugin-winston` - Structured logging
- `@gasket/plugin-command` - CLI command support

### HTTPS Proxy Configuration

Configure the proxy settings in `gasket.ts`:

```typescript
export default makeGasket({
  httpsProxy: {
    protocol: 'http',        // Protocol to proxy server
    hostname: 'localhost',   // Proxy hostname
    port: 80,               // Proxy port
    target: {
      host: 'localhost',    // Target hostname
      port: 3000           // Target port (Next.js dev server)
    },
    xfwd: true,            // Add X-Forwarded-* headers
    ws: true               // Enable WebSocket proxying
  }
});
```

## Testing

The template includes comprehensive testing setup:

- **Vitest** - Fast test runner
- **React Testing Library** - React component testing utilities
- **JSDOM** - DOM simulation for server-side testing
- **TypeScript support** - Type-safe tests

Write tests in the `test/` directory:

```tsx
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { describe, it, expect } from 'vitest';
import IndexPage from '@/pages/index';

const messages = {
  gasket_welcome: 'Welcome to Gasket!',
  gasket_learn: 'Learn Gasket',
  gasket_edit_page: 'To get started, edit pages/index.js and save to reload.'
};

describe('IndexPage', () => {
  it('renders welcome message', () => {
    render(
      <IntlProvider locale="en-US" messages={messages}>
        <IndexPage />
      </IntlProvider>
    );
    expect(screen.getByText('Welcome to Gasket!')).toBeInTheDocument();
  });
});
```

## Next Steps

- Add more pages in the `pages/` directory
- Create API routes in `pages/api/`
- Customize the HTTPS proxy settings
- Add additional languages for internationalization
- Add database connections and authentication
- Set up CI/CD pipeline
- Add more comprehensive testing
