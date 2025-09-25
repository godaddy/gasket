# Gasket Next.js Express Template

A full-stack TypeScript web application template built with Gasket, Next.js Pages Router, Express custom server, and internationalization support.

## Overview

This template provides a production-ready starting point for building web applications using:

- **Next.js 15** with Pages Router - React framework with file-based routing
- **Express Custom Server** - Full control over server-side rendering and API routes
- **TypeScript** - Type-safe development with modern JavaScript features
- **Gasket** - Plugin architecture for extensible applications
- **React Intl** - Internationalization with multi-language support
- **Vitest** - Lightning-fast unit testing with React Testing Library

## Features

- ✅ **Next.js Pages Router** with TypeScript support
- ✅ **Custom Express server** for advanced server-side control
- ✅ **Internationalization** pre-configured with English and French
- ✅ **Server-side rendering** with Gasket data injection
- ✅ **API routes** and custom server endpoints capability
- ✅ **Testing setup** with Vitest, React Testing Library, and JSDOM
- ✅ **ESLint configuration** with React and Next.js rules
- ✅ **Development tools** with hot reloading and TypeScript watching
- ✅ **Production build** optimization

## Quick Start

Create a new Next.js Pages Router project with custom Express server:

```bash
npx create-gasket-app@latest my-app --template @gasket/template-nextjs-express
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
├── server.ts              # Custom Express server
├── intl.ts                # Internationalization manager
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── dist/                  # Built server files
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run local` | Start development with TypeScript watch and custom server |
| `npm run build` | Build TypeScript server and Next.js application |
| `npm run start` | Start production server |
| `npm run preview` | Build and start production server |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run docs` | Generate and serve documentation |
| `npm run lint` | Check code style and quality |

## Development

### Custom Express Server

The template includes a custom Express server (`server.ts`) that wraps Next.js, giving you full control over:

- **Server-side rendering** - Custom SSR logic and data fetching
- **API routes** - Express routes alongside Next.js API routes
- **Middleware** - Custom middleware for authentication, logging, etc.
- **Error handling** - Custom error pages and handling logic

The development setup runs two concurrent processes:
1. **TypeScript Watch** - Compiles server TypeScript files on change
2. **Custom Express Server** - Runs Next.js with `GASKET_DEV=1` for development mode

### Pages Router vs App Router

This template uses Next.js Pages Router, which differs from App Router:

- **File-based routing** in the `pages/` directory
- **`_app.tsx`** for global app wrapper and providers
- **`_document.ts`** for HTML document structure
- **`getServerSideProps`** and `getStaticProps` for data fetching
- **API routes** in `pages/api/` directory

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

## Configuration

The template includes these Gasket plugins by default:

- `@gasket/plugin-nextjs` - Next.js integration
- `@gasket/plugin-express` - Express custom server
- `@gasket/plugin-intl` - Internationalization support
- `@gasket/plugin-https` - HTTPS and server lifecycle management
- `@gasket/plugin-webpack` - Webpack configuration
- `@gasket/plugin-winston` - Structured logging
- `@gasket/plugin-command` - CLI command support

### Custom Server Routes

Add custom Express routes in your `server.ts` or via Gasket plugins:

```typescript
// Example plugin for custom routes
export default {
  name: 'api-routes',
  hooks: {
    express(gasket, app) {
      app.get('/api/custom', (req, res) => {
        res.json({ message: 'Custom API endpoint' });
      });
    }
  }
};
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
- Add custom Express middleware and routes
- Customize the internationalization with additional languages
- Add database connections and authentication
- Set up CI/CD pipeline
- Add more comprehensive testing
