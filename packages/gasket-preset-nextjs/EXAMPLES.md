# @gasket/preset-nextjs Examples

This document provides examples of using the `@gasket/preset-nextjs` preset and understanding its configurations.

## Using the Preset

### Creating a new Next.js project

```bash
# Create a new Next.js project using the preset
npx create-gasket-app@latest my-app --presets @gasket/preset-nextjs

# Or with yarn
yarn create gasket-app my-app --presets @gasket/preset-nextjs

# With config to skip prompts
npx create-gasket-app@latest my-app \
  --presets @gasket/preset-nextjs \
  --config '{"typescript": true, "nextServerType": "appRouter", "nextDevProxy": false}'
```

## Generated Project Structure

### JavaScript Project (App Router)

```
my-app/
├── app/
│   ├── layout.js          # Root layout component
│   └── page.js            # Home page component
├── next.config.js         # Next.js configuration
├── gasket.js              # Gasket configuration
├── package.json           # Project configuration
└── README.md              # Project documentation
```

### TypeScript Project (Custom Server)

```
my-app/
├── app/
│   ├── layout.tsx         # Root layout component (TypeScript)
│   └── page.tsx           # Home page component (TypeScript)
├── server.ts              # Custom server entry point
├── next.config.js         # Next.js configuration
├── gasket.ts              # Gasket configuration (TypeScript)
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project configuration
└── README.md              # Project documentation
```

## Server Type Examples

### App Router

```js
// When nextServerType: 'appRouter' is selected
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginLogger from '@gasket/plugin-logger';
import pluginNextjs from '@gasket/plugin-nextjs';
import pluginIntl from '@gasket/plugin-intl';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';

export default makeGasket({
  plugins: [
    pluginCommand,
    pluginDocs,
    pluginDocusaurus,
    pluginDynamicPlugins,
    pluginLogger,
    pluginNextjs,
    pluginIntl,
    pluginWebpack,
    pluginWinston
  ]
});

// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// app/page.js
export default function HomePage() {
  return (
    <main>
      <h1>Welcome to your Gasket Next.js App</h1>
    </main>
  );
}
```

### Custom Server

```js
// When nextServerType: 'customServer' is selected
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginLogger from '@gasket/plugin-logger';
import pluginNextjs from '@gasket/plugin-nextjs';
import pluginIntl from '@gasket/plugin-intl';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';
import pluginHttps from '@gasket/plugin-https';
import pluginExpress from '@gasket/plugin-express';

export default makeGasket({
  plugins: [
    pluginCommand,
    pluginDocs,
    pluginDocusaurus,
    pluginDynamicPlugins,
    pluginLogger,
    pluginNextjs,
    pluginIntl,
    pluginWebpack,
    pluginWinston,
    pluginHttps,
    pluginExpress
  ]
});

// server.js
import gasket from './gasket.js';
gasket.actions.startServer();

// Custom route example
export default {
  name: 'api-routes',
  hooks: {
    express(gasket, app) {
      app.get('/api/health', (req, res) => {
        res.json({ status: 'healthy' });
      });

      app.get('/api/data', (req, res) => {
        res.json({ data: [] });
      });
    }
  }
};
```

## Integration Examples

### With TypeScript

```typescript
// gasket.ts
import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginLogger from '@gasket/plugin-logger';
import pluginNextjs from '@gasket/plugin-nextjs';
import pluginIntl from '@gasket/plugin-intl';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';

export default makeGasket({
  plugins: [
    pluginCommand,
    pluginDocs,
    pluginDocusaurus,
    pluginDynamicPlugins,
    pluginLogger,
    pluginNextjs,
    pluginIntl,
    pluginWebpack,
    pluginWinston
  ]
});

// types/common.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

// app/users/page.tsx
import type { User } from '../../types/common.js';

export default async function UsersPage() {
  const users: User[] = [
    { id: 1, name: 'John', email: 'john@example.com' }
  ];

  return (
    <main>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </main>
  );
}
```

### With Development Proxy

```js
// gasket.js - when nextDevProxy: true
import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';
import pluginLogger from '@gasket/plugin-logger';
import pluginNextjs from '@gasket/plugin-nextjs';
import pluginIntl from '@gasket/plugin-intl';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';
import pluginHttpsProxy from '@gasket/plugin-https-proxy';

export default makeGasket({
  plugins: [
    pluginCommand,
    pluginDocs,
    pluginDocusaurus,
    pluginDynamicPlugins,
    pluginLogger,
    pluginNextjs,
    pluginIntl,
    pluginWebpack,
    pluginWinston,
    pluginHttpsProxy
  ],
  httpsProxy: {
    hostname: 'localhost',
    port: 8443,
    target: {
      host: 'localhost',
      port: 3000
    }
  }
});

// Access your app at https://localhost:8443 instead of http://localhost:3000
```

### With Internationalization

```js
// gasket.js
export default makeGasket({
  plugins: [
    // ... other plugins
    pluginIntl
  ],
  intl: {
    locales: ['en-US', 'es-ES', 'fr-FR'],
    defaultLocale: 'en-US'
  }
});

// app/[locale]/layout.js
import { gasketData } from '@gasket/data';

export default function LocaleLayout({ children, params }) {
  const { locale } = params;

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}

// locales/en-US.json
{
  "welcome": "Welcome to our app",
  "description": "This is a Gasket Next.js application"
}

// locales/es-ES.json
{
  "welcome": "Bienvenido a nuestra aplicación",
  "description": "Esta es una aplicación Gasket Next.js"
}
```

### Production Configuration

```js
// gasket.js - production setup with minimal plugins
import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';
import pluginLogger from '@gasket/plugin-logger';
import pluginNextjs from '@gasket/plugin-nextjs';
import pluginIntl from '@gasket/plugin-intl';
import pluginWebpack from '@gasket/plugin-webpack';
import pluginWinston from '@gasket/plugin-winston';

export default makeGasket({
  plugins: [
    pluginCommand,
    pluginLogger,
    pluginNextjs,
    pluginIntl,
    pluginWebpack,
    pluginWinston
  ],
  winston: {
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug'
  }
});
```

## Interactive Prompts

During app creation, the preset prompts for:

1. **TypeScript Support**: Configures TypeScript if selected
2. **Next.js Server Type**: Determines server configuration
3. **Development Proxy**: Configures HTTPS proxy for local development

Example prompt flow:

```bash
$ npx create-gasket-app@latest my-app --presets @gasket/preset-nextjs

? Do you want to use TypeScript? (y/N) y
? Which server type would you like to use? (Use arrow keys)
  ❯ Page Router w/ Custom Server
    Page Router
    App Router
? Do you want an HTTPS proxy for the Next.js server? (y/N) n
```

Note: The HTTPS proxy prompt only appears if you don't select "Page Router w/ Custom Server".
