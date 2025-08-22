# @gasket/preset-api Examples

This document provides examples of using the `@gasket/preset-api` preset and understanding its hooks.

## Using the Preset

### Creating a new API project

```bash
# Create a new API project using the preset
npx create-gasket-app@latest my-api --presets @gasket/preset-api

# Or with yarn
yarn create gasket-app my-api --presets @gasket/preset-api

# With config to skip prompts
npx create-gasket-app@latest my-api \
  --presets @gasket/preset-api \
  --config '{"server": "express", "typescript": true, "useSwagger": true}'
```

## Generated Project Structure

### JavaScript Project

```
my-api/
├── server.js              # Server entry point
├── gasket.js              # Gasket configuration
├── package.json           # Project configuration
└── README.md              # Project documentation
```

### TypeScript Project

```
my-api/
├── gasket.ts              # Gasket configuration (TypeScript)
├── package.json           # Project configuration
└── README.md              # Project documentation
```

## Server Framework Examples

### Express Server

```js
// When server: 'express' is selected
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginExpress from '@gasket/plugin-express';
import pluginHttps from '@gasket/plugin-https';

export default makeGasket({
  plugins: [
    pluginExpress,
    pluginHttps,
    // ... other plugins
  ]
});

// Your route definitions
export default {
  name: 'my-routes',
  hooks: {
    express(gasket, app) {
      app.get('/api/health', (req, res) => {
        res.json({ status: 'healthy' });
      });

      app.get('/api/users', (req, res) => {
        res.json({ users: [] });
      });
    }
  }
};
```

### Fastify Server

```js
// When server: 'fastify' is selected
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginFastify from '@gasket/plugin-fastify';
import pluginHttps from '@gasket/plugin-https';

export default makeGasket({
  plugins: [
    pluginFastify,
    pluginHttps,
    // ... other plugins
  ]
});

// Your route definitions
export default {
  name: 'my-routes',
  hooks: {
    fastify(gasket, app) {
      app.get('/api/health', async (request, reply) => {
        return { status: 'healthy' };
      });

      app.get('/api/users', async (request, reply) => {
        return { users: [] };
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
import pluginExpress from '@gasket/plugin-express';
import pluginTypescript from '@gasket/plugin-typescript';

export default makeGasket({
  plugins: [
    pluginExpress,
    pluginTypescript,
    // ... other plugins
  ]
});

// types/api.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

// routes/users.ts
import type { User } from '../types/api.js';

export default {
  name: 'user-routes',
  hooks: {
    express(gasket, app) {
      app.get('/api/users', (req, res) => {
        const users: User[] = [
          { id: 1, name: 'John', email: 'john@example.com' }
        ];
        res.json({ users });
      });
    }
  }
};
```

### With Swagger

```js
// gasket.js - when useSwagger: true
import { makeGasket } from '@gasket/core';
import pluginSwagger from '@gasket/plugin-swagger';

export default makeGasket({
  plugins: [
    pluginSwagger,
    // ... other plugins
  ],
  swagger: {
    jsdoc: {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'My API',
          version: '1.0.0'
        }
      },
      apis: ['./routes/*.js']
    }
  }
});

// routes/users.js
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 */
export default {
  name: 'user-routes',
  hooks: {
    express(gasket, app) {
      app.get('/api/users', (req, res) => {
        res.json({ users: [] });
      });
    }
  }
};
```
