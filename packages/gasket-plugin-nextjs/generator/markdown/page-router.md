### Page Router

This Gasket app uses Next.js 14 with [Page Router] which relies on the traditional file-based routing within the pages directory. The integration with Next.js 14 leverages features like server-side rendering and static optimization, providing a streamlined development process and ensuring the app remains efficient and scalable.

{{#if nextDevProxy}}
### Development Proxy

The HTTPS proxy in this Gasket app forwards requests to the default Next.js server, enabling HTTPS for development and support on deployed servers.
{{/if}}
{{#if typescript}}
{{#if (eq nextServerType 'pageRouter')}}
### TypeScript & Page Router

When using TypeScript with Next.js and Gasket on the default Next.js server, the Page Router files also operate within a CommonJS (CJS) environment. This contrasts with Gasket's configuration, which is set to type: module for ES Modules (ESM), requiring careful handling to ensure compatibility between the two environments.

Additionally, Gasket files like gasket.ts, gasket-data.ts, intl.ts, and app-level plugins can all be written in TypeScript. This ensures type safety and better tooling support across the Gasket app, even when working within Next.js’s CJS environment.

#### ESM & TypeScript

A common workaround when using ESM in a TypeScript project with `"type": "module"` set in `package.json` is to import `.ts` files using the `.js` extension. For example:

```ts
import { myFunction } from './myModule.js';
```

Here, `myModule.ts` is the actual TypeScript file, but it's imported using the `.js` extension. TypeScript is able to resolve `myModule.ts` to `myModule.js`, making the import work at runtime.

For more information, see the extended documentation in the [Gasket TypeScript] doc and the [@gasket/plugin-typescript] package.
{{/if}}
{{/if}}
