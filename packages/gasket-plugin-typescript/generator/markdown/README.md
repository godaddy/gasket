### TypeScript

This API is built with TypeScript. To compile the TypeScript code, run:

```bash
{{{packageManager}}} run build
```

Use the `start` script to run the compiled code:

```bash
{{{packageManager}}} start
```

Run `build` and `start` together:

```bash
{{{packageManager}}} run preview
```

Compiled code will be placed in the `dist` directory. For local development, the [tsx] runtime is used and the watcher will be started automatically when running the `local` script.

#### ESM & TypeScript

A common workaround when using ESM in a TypeScript project with `"type": "module"` set in `package.json` is to import `.ts` files using the `.js` extension. For example:

```ts
import { myFunction } from './myModule.js';
```

Here, `myModule.ts` is the actual TypeScript file, but it's imported using the `.js` extension. TypeScript is able to resolve `myModule.ts` to `myModule.js`, making the import work at runtime.

For more information, see the extended documentation in the [Gasket TypeScript] doc and the [@gasket/plugin-typescript] package.
