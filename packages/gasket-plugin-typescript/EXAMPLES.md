# @gasket/plugin-typescript Examples

> **⚠️ Important:** This plugin is **create-time only** and is NOT installed in the final application. It's used by presets during `create-gasket-app` to set up TypeScript configuration and files, then is discarded.

## Create Hook Usage

The plugin's `create` hook automatically runs during app creation. Here are examples of how it affects different app types:

### API App Configuration

```json
// Results in these package.json additions for API apps:
{
  "devDependencies": {
    "tsx": "^4.19.3",
    "typescript": "^5.8.2"
  },
  "scripts": {
    "prebuild": "tsx gasket.ts build",
    "build": "tsc",
    "preview": "npm run build && npm run start",
    "start": "node dist/server.js",
    "local": "tsx watch server.ts"
  },
  "eslintIgnore": ["dist"]
}
```

### Next.js App Configuration

```json
// Results in these package.json additions for Next.js apps:
{
  "dependencies": {
    "tsx": "^4.19.3",
    "typescript": "^5.8.2"
  },
  "devDependencies": {
    "concurrently": "^9.1.2"
  }
}
```

### Custom Server Next.js Configuration

```js
// For apps with nextServerType: 'customServer'
// Generates both next/tsconfig.json and shared/server.ts files
// Adds 'dist' to .gitignore and eslintIgnore
```

### Next.js App tsconfig.server.json

**When generated:** Only for Next.js apps with custom server or HTTPS proxy setup.

**Why needed:** Separate configuration for server-side TypeScript compilation vs client-side bundling.

**Conditions for inclusion:**
- `nextServerType === 'customServer'` OR
- `nextDevProxy === true`

**NOT included when:**
- Standard Next.js setup without custom server or dev proxy

**Key differences from main tsconfig.json:**
- **Module system**: Uses `NodeNext` instead of `bundler` (for Node.js runtime)
- **Compilation**: Actually compiles to `dist/` (no `noEmit`)
- **Scope**: Only includes server files, not React components
- **Next.js plugin**: Excluded (server doesn't need Next.js bundler integration)
- **JSX**: No JSX support (server-only)

### Generated server.ts

```typescript
// Imports use the .js to support a type module application
// See README for more information
import gasket from './gasket.js';
gasket.actions.startServer();

// Or for proxy server configuration:
// gasket.actions.startProxyServer();
```

## Package Manager Support

The plugin adapts scripts based on the package manager:

### npm

```json
{
  "scripts": {
    "preview": "npm run build && npm run start"
  }
}
```

### yarn

```json
{
  "scripts": {
    "preview": "yarn build && yarn start"
  }
}
```

### pnpm

```json
{
  "scripts": {
    "preview": "pnpm build && pnpm start"
  }
}
```

## ESM TypeScript Pattern

The plugin follows the ESM TypeScript pattern where `.js` extensions are used in imports:

```typescript
// gasket.ts
import { makeGasket } from '@gasket/core';
import pluginExpress from '@gasket/plugin-express';

export default makeGasket({
  plugins: [
    pluginExpress
  ]
});

// server.ts
import gasket from './gasket.js'; // Note .js extension
gasket.actions.startServer();
```

## README Links

The plugin automatically adds relevant documentation links to the generated README:

```markdown
- [tsx](https://tsx.is/)
- [@gasket/plugin-typescript](https://gasket.dev/docs/plugins/plugin-typescript/)
- [Gasket TypeScript](https://gasket.dev/docs/typescript/)
```
