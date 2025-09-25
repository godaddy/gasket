# Gasket API Fastify Template

A high-performance TypeScript API template built with Gasket and Fastify.

## Overview

This template provides a minimal, well-structured starting point for building RESTful APIs using:

- **Fastify** - Fast and low overhead web framework for Node.js
- **TypeScript** - Type-safe development with modern JavaScript features
- **Gasket** - Plugin architecture for extensible applications
- **Swagger/OpenAPI** - Automatic API documentation generation
- **Winston** - Production-grade logging
- **Vitest** - Lightning-fast unit testing

## Features

- ✅ **TypeScript configuration** with ES modules support
- ✅ **Fastify server** with high-performance request handling
- ✅ **Swagger documentation** auto-generated from JSDoc comments
- ✅ **Structured logging** with Winston
- ✅ **Testing setup** with Vitest and coverage reporting
- ✅ **Development server** with hot reloading via tsx
- ✅ **Build pipeline** for production deployment
- ✅ **ESLint configuration** with GoDaddy style guide

## Quick Start

Create a new API project using this template:

```bash
npx create-gasket-app@latest my-api --template @gasket/template-api-fastify
```

## Project Structure

```
my-api/
├── gasket.ts              # Gasket configuration
├── server.ts              # Server entry point
├── plugins/               # Custom Gasket plugins
│   └── routes-plugin.ts   # API route definitions
├── swagger.json           # OpenAPI schema (generated)
├── test/                  # Test files
├── tsconfig.json          # TypeScript configuration
└── dist/                  # Built JavaScript (after npm run build)
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run local` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm run start` | Start production server from built files |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run docs` | Generate and serve API documentation |
| `npm run lint` | Check code style and quality |

## API Routes

The template includes a sample route to get you started:

### `GET /default`

Returns a welcome message.

**Response:**
```json
{
  "message": "Welcome to your default route..."
}
```

## Adding New Routes

Define routes in `plugins/routes-plugin.ts` using the `fastify` lifecycle:

```typescript
export default {
  name: 'routes-plugin',
  hooks: {
    fastify(gasket, app) {
      /**
       * @swagger
       * /users:
       *   get:
       *     summary: Get all users
       *     responses:
       *       200:
       *         description: List of users
       */
      app.get('/users', async (req, res) => {
        res.send({ users: [] });
      });
    }
  }
};
```

## Configuration

The template includes these Gasket plugins by default:

- `@gasket/plugin-fastify` - Fastify server integration
- `@gasket/plugin-https` - HTTPS and server lifecycle management
- `@gasket/plugin-swagger` - OpenAPI documentation generation
- `@gasket/plugin-winston` - Structured logging
- `@gasket/plugin-command` - CLI command support

Additional plugins can be loaded dynamically via the `commands` configuration in `gasket.ts`.

## Why Fastify?

Fastify offers several advantages over Express:

- **Performance** - Up to 30,000 requests per second, nearly twice as fast as Express
- **Type Safety** - Built with TypeScript in mind with excellent type definitions
- **Schema Validation** - Built-in JSON schema validation for requests and responses
- **Plugin Architecture** - Encapsulated plugin system with dependency management
- **Modern Features** - Async/await support, HTTP/2, and built-in logging

## Documentation

Run `npm run docs` to generate interactive API documentation using Swagger UI. The docs are automatically generated from JSDoc comments in your route handlers.

## Testing

The template includes Vitest for testing. Write tests in the `test/` directory:

```typescript
import { describe, it, expect } from 'vitest';

describe('API Routes', () => {
  it('should return welcome message', () => {
    // Your test code here
  });
});
```

## Next Steps

- Add your API routes in `plugins/routes-plugin.ts`
- Configure database connections and models
- Set up authentication and authorization
- Add input validation using Fastify's schema validation
- Configure environment-specific settings
- Set up CI/CD pipeline
