# Gasket Next.js App Router Template

A modern full-stack TypeScript web application template built with Gasket, Next.js App Router, and internationalization support.

## Overview

This template provides a production-ready starting point for building web applications using:

- **Next.js 15** with App Router - React framework with file-based routing
- **TypeScript** - Type-safe development with modern JavaScript features
- **Gasket** - Plugin architecture for extensible applications
- **React Intl** - Internationalization with multi-language support
- **HTTPS Proxy** - Development proxy for secure local development
- **Vitest** - Lightning-fast unit testing with React Testing Library

## Features

- ✅ **Next.js App Router** with TypeScript support
- ✅ **Internationalization** pre-configured with English and French
- ✅ **HTTPS development proxy** for secure local testing
- ✅ **Server-side rendering** with Gasket data injection
- ✅ **Testing setup** with Vitest, React Testing Library, and JSDOM
- ✅ **ESLint configuration** with React and Next.js rules
- ✅ **Development tools** with hot reloading and TypeScript watching
- ✅ **Production build** optimization

## Quick Start

Create a new Next.js App Router project using this template:

```bash
npx create-gasket-app@latest my-app --template @gasket/template-nextjs-app
```

## Project Structure

```
my-app/
├── app/                   # Next.js App Router pages
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page component
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
| `npm run build` | Build TypeScript server and Next.js application |
| `npm run start` | Start production servers (HTTPS proxy + Next.js) |
| `npm run preview` | Build and start production servers |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run docs` | Generate and serve documentation |
| `npm run lint` | Check code style and quality |

## Development

The template includes a sophisticated development setup:

### HTTPS Development Proxy

The template includes an HTTPS proxy server that runs alongside Next.js during development, allowing you to test secure features locally:

- **HTTPS Proxy**: `https://localhost:80`
- **Next.js Dev Server**: `http://localhost:3000`
- **Proxy Target**: Routes HTTPS traffic to the Next.js dev server

### Hot Reloading

Three concurrent processes run during development:
1. **TypeScript Watch** - Compiles server TypeScript files on change
2. **HTTPS Proxy Server** - Provides secure development environment
3. **Next.js Dev Server** - Hot reloads React components and pages

## Pages and Layout

### Root Layout (`app/layout.tsx`)

The root layout is enhanced with Gasket data injection using `withGasketData`:

```tsx
import { withGasketData } from '@gasket/nextjs/layout';
import gasket from '@/gasket';

function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}

export default withGasketData(gasket)(RootLayout);
```

### Adding New Pages

Create new pages in the `app/` directory following Next.js App Router conventions:

```tsx
// app/about/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - My App'
};

export default function AboutPage() {
  return <h1>About Page</h1>;
}
```

## Configuration

The template includes these Gasket plugins by default:

- `@gasket/plugin-nextjs` - Next.js integration
- `@gasket/plugin-intl` - Internationalization support
- `@gasket/plugin-https-proxy` - HTTPS development proxy
- `@gasket/plugin-webpack` - Webpack configuration
- `@gasket/plugin-winston` - Structured logging
- `@gasket/plugin-command` - CLI command support

### Environment-Specific Configuration

Configure different settings for different environments in `gasket.ts`:

```typescript
export default makeGasket({
  // Base configuration
  intl: {
    locales: ['en-US', 'fr-FR'],
    defaultLocale: 'en-US'
  },
  // Environment-specific overrides
  environments: {
    production: {
      httpsProxy: {
        port: 443,
        target: { port: 3000 }
      }
    }
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
import { describe, it, expect } from 'vitest';
import IndexPage from '@/app/page';

describe('IndexPage', () => {
  it('renders welcome message', () => {
    render(<IndexPage />);
    expect(screen.getByText('Welcome to Gasket!')).toBeInTheDocument();
  });
});
```

## Next Steps

- Add more pages in the `app/` directory
- Customize the internationalization with additional languages
- Add database connections and API routes
- Configure authentication and authorization
- Set up CI/CD pipeline
- Add more comprehensive testing
