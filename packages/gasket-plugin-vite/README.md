# @gasket/plugin-vite

Gasket plugin for integrating Vite with Express server.

## Installation

```bash
npm install @gasket/plugin-vite vite react react-dom @vitejs/plugin-react
```

## Usage

Add the plugin to your `gasket.js`:

```javascript
import { makeGasket } from '@gasket/core';
import pluginExpress from '@gasket/plugin-express';
import pluginVite from '@gasket/plugin-vite';

export default makeGasket({
  plugins: [
    pluginExpress,
    pluginVite  // Add the Vite plugin
  ]
});
```

That's it! The plugin handles all Vite integration automatically.

## What It Does

### Development Mode

- Creates Vite dev server in middleware mode
- Integrates with Express (no separate ports!)
- Enables Hot Module Replacement (HMR)
- Handles JSX transformation
- Provides React Fast Refresh

### Production Mode

- Serves built files from `dist/`
- SPA fallback routing
- Static asset caching
- Production optimizations

## Configuration

You can configure Vite through `gasket.js`:

```javascript
export default makeGasket({
  plugins: [pluginExpress, pluginVite],
  
  vite: {
    // These options are passed to Vite
    server: {
      port: 5173  // Dev server port (if not in middleware mode)
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  }
});
```

## Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "local": "NODE_ENV=development gasket start",
    "build": "vite build",
    "preview": "NODE_ENV=production gasket start"
  }
}
```

## File Structure

```
my-app/
├── gasket.js           # Gasket config with plugin
├── vite.config.js      # Vite configuration
├── index.html          # HTML template
├── src/
│   ├── main.jsx        # React entry point
│   └── App.jsx         # Your React app
└── package.json
```

## Example App

See the example app in `/examples/vite-react-app/`

## Actions

The plugin provides these actions:

### `getVite(gasket)`

Get the Vite dev server instance (development mode only).

```javascript
const vite = await gasket.actions.getVite();
```

### `getViteConfig(gasket)`

Get the Vite configuration.

```javascript
const config = await gasket.actions.getViteConfig();
```

## How It Works

### Development

1. Gasket starts Express server
2. Plugin creates Vite dev server in middleware mode
3. Vite middleware is added to Express
4. All requests go through Express → Vite middleware
5. Vite handles HMR via WebSocket

### Production

1. Run `vite build` to create `dist/`
2. Gasket starts Express server
3. Plugin serves static files from `dist/`
4. SPA fallback for client-side routing

## Comparison to Manual Setup

### Without Plugin (Manual)

```javascript
// server.js - You write this entire file
import gasket from './gasket.js';
import { createServer as createViteServer } from 'vite';

const { handler: app } = await gasket.exec('createServers');

if (isDev) {
  const vite = await createViteServer({ /* ... */ });
  app.use(vite.middlewares);
} else {
  // ... production setup
}

app.listen(3000);
```

### With Plugin

```javascript
// gasket.js - Just add the plugin!
export default makeGasket({
  plugins: [
    pluginExpress,
    pluginVite  // Done!
  ]
});
```

The plugin handles everything automatically.

## License

MIT

