---
"@gasket/plugin-fastify": major
"@gasket/template-api-fastify": major
---

Upgrade to Fastify v5 with backwards-compatible adapter pattern

**Breaking Changes:**
- **Default Fastify version is now v5.0.0** (was v4.29.1)
- Fastify v5 requires Node.js v20+ (Fastify v4 supported Node.js 18+)
- New Gasket apps created from `@gasket/template-api-fastify` will use Fastify v5 by default

**@gasket/plugin-fastify:**
- Upgrade default Fastify dependency to `^5.0.0`
- Add adapter pattern to maintain backwards compatibility with Fastify v4
- Automatically detect installed Fastify version and apply correct configuration
- Support Fastify v5 breaking changes (loggerInstance, useSemicolonDelimiter)
- Update peerDependencies to support `fastify@^4.29.1 || ^5.0.0`
- Convert `getAppInstance()` to async function
- Add runtime checks for `app.use()` availability in `createServers`

**Adapter Pattern:**
- `FastifyAdapter`: Abstract base class for version adapters
- `FastifyV4Adapter`: Handles Fastify v4 configuration (`logger` option)
- `FastifyV5Adapter`: Handles Fastify v5 configuration (`loggerInstance`, `useSemicolonDelimiter`)
- Automatic version detection and adapter selection at runtime

**Migration Guide:**

*Option 1: Upgrade to Fastify v5 (Recommended)*
```bash
npm install fastify@^5.0.0
# If using @gasket/plugin-middleware:
npm install @fastify/express@^4.0.3
```
Requirements:
- Node.js v20 or higher
- Update any code using deprecated Fastify v4 APIs (see Fastify migration guide)

*Option 2: Stay on Fastify v4*
```bash
npm install fastify@^4.29.1
# If using @gasket/plugin-middleware:
npm install @fastify/express@^3.0.0
```
The adapter pattern automatically detects v4 and applies appropriate configuration.
No code changes required in your Gasket app.

**Note:** Users of `@gasket/plugin-middleware` with Fastify must explicitly install `@fastify/express` (as of Gasket v7.6.0, per PR #1318). Version must match Fastify major version:
- Fastify v4 → `@fastify/express@^3.0.0`
- Fastify v5 → `@fastify/express@^4.0.3`
