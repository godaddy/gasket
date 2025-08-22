# @gasket/plugin-swagger Examples

This document provides working examples for all exported interfaces and functions from `@gasket/plugin-swagger`.

## Plugin Configuration

### Basic Plugin Setup

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginSwagger from '@gasket/plugin-swagger';

export default makeGasket({
  plugins: [
    pluginSwagger
  ],
  swagger: {
    definitionFile: 'swagger.json',
    apiDocsRoute: '/api-docs'
  }
});
```

### Complete Configuration with JSDoc Generation

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginSwagger from '@gasket/plugin-swagger';

export default makeGasket({
  plugins: [
    pluginSwagger
  ],
  swagger: {
    definitionFile: 'swagger.json',
    apiDocsRoute: '/api-docs',
    jsdoc: {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'My API',
          version: '1.0.0',
          description: 'A sample API'
        },
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Development server'
          }
        ]
      },
      apis: [
        './routes/*.js',
        './plugins/*.js'
      ]
    },
    ui: {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'My API Documentation'
    }
  }
});
```

### YAML Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginSwagger from '@gasket/plugin-swagger';

export default makeGasket({
  plugins: [
    pluginSwagger
  ],
  swagger: {
    definitionFile: 'swagger.yaml',
    apiDocsRoute: '/docs'
  }
});
```

## JSDoc API Documentation Examples

### Basic Route Documentation

```js
// routes/users.js

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/users', (req, res) => {
  res.json([]);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/users/:id', (req, res) => {
  res.json({});
});
```

### Schema Definitions

```js
// schemas/user.js

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: User ID
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *         name:
 *           type: string
 *           description: User full name
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 */
```

### POST Route with Request Body

```js
// routes/auth.js

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post('/auth/login', (req, res) => {
  res.json({ token: 'jwt-token', user: {} });
});
```

## Advanced Configuration Examples

### Custom Express UI Options

```js
// gasket.js
export default makeGasket({
  plugins: [pluginSwagger],
  swagger: {
    apiDocsRoute: '/documentation',
    ui: {
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 50px 0 }
      `,
      customSiteTitle: 'My API Documentation',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true
      }
    }
  }
});
```

### Multiple API Documentation

```js
// gasket.js - Multiple API versions
export default makeGasket({
  plugins: [pluginSwagger],
  swagger: {
    jsdoc: {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Multi-Version API',
          version: '1.0.0'
        }
      },
      apis: [
        './routes/v1/*.js',
        './routes/v2/*.js',
        './schemas/*.js'
      ]
    }
  }
});
```

## Plugin Integration Examples

### Custom Plugin Using Swagger

```js
// plugins/api-plugin.js
export default {
  name: 'api-plugin',
  hooks: {
    express(gasket, app) {
      // Add routes that will be documented by Swagger

      /**
       * @swagger
       * /health:
       *   get:
       *     summary: Health check
       *     tags: [System]
       *     responses:
       *       200:
       *         description: Service is healthy
       */
      app.get('/health', (req, res) => {
        res.json({ status: 'ok' });
      });
    },

    async build(gasket) {
      // Custom logic during build that might affect swagger generation
      gasket.logger.info('Building API documentation...');
    }
  }
};
```
