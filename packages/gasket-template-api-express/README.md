# Gasket API Express Template

A production-ready TypeScript API template built with Gasket and Express.

## Overview

This template provides a minimal, well-structured starting point for building RESTful APIs using:

- **Express** - Fast, unopinionated web framework for Node.js
- **TypeScript** - Type-safe development with modern JavaScript features
- **Gasket** - Plugin architecture for extensible applications
- **Swagger/OpenAPI** - Automatic API documentation generation
- **Winston** - Production-grade logging
- **Vitest** - Lightning-fast unit testing

## Features

- ✅ **TypeScript configuration** with ES modules support
- ✅ **Express server** with middleware pipeline
- ✅ **Swagger documentation** auto-generated from JSDoc comments
- ✅ **Structured logging** with Winston
- ✅ **Testing setup** with Vitest and coverage reporting
- ✅ **Development server** with hot reloading via tsx
- ✅ **Build pipeline** for production deployment
- ✅ **ESLint configuration** with GoDaddy style guide

## Quick Start

Create a new API project using this template:

```bash
npx create-gasket-app@latest my-api --template @gasket/template-api-express
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

Define routes in `plugins/routes-plugin.ts` using the `express` lifecycle:

```typescript
export default {
  name: 'routes-plugin',
  hooks: {
    express(gasket, app) {
      /**
       * @swagger
       * /users:
       *   get:
       *     summary: Get all users
       *     responses:
       *       200:
       *         description: List of users
       */
      app.get('/users', (req, res) => {
        res.json({ users: [] });
      });
    }
  }
};
```

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
- Add input validation and error handling
- Configure environment-specific settings
- Set up CI/CD pipeline
