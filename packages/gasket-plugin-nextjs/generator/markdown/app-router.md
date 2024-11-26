### App Router

This Gasket app uses Next.js 14 with [App Router] which allows for intuitive, file-based routing within the app directory. The integration with Next.js 14 enhances development by leveraging features like automatic static optimization and server-side rendering, ensuring a scalable and efficient web application.

{{#if nextDevProxy}}
### HTTPS Proxy

The HTTPS proxy in this Gasket app forwards requests to the default Next.js server, enabling HTTPS for development and support on deployed servers.
{{/if}}

{{#if typescript}}
### TypeScript & App Router

When using TypeScript with Next.js and Gasket on the default Next.js server, the App Router files omit extensions at the root level. This is because Next.js builds TypeScript in a CommonJS (CJS) environment, while Gasket is set to type: module for ES Modules (ESM). This difference requires careful handling to ensure compatibility between the two environments.

Additionally, Gasket files like gasket.ts, gasket-data.ts, intl.ts, and app-level plugins can all be written in TypeScript. This allows for type safety and better tooling support across the Gasket app, even as it integrates with Next.js’s CJS environment.

#### ESM & TypeScript

A common workaround when using ESM in a TypeScript project with `"type": "module"` set in `package.json` is to import `.ts` files using the `.js` extension. For example:

```ts
import { myFunction } from './myModule.js';
```

Here, `myModule.ts` is the actual TypeScript file, but it's imported using the `.js` extension. TypeScript is able to resolve `myModule.ts` to `myModule.js`, making the import work at runtime.

For more information, see the extended documentation in the [Gasket TypeScript] doc and the [@gasket/plugin-typescript] package.
{{/if}}
