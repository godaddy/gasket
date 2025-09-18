# {{{appName}}}

## Overview

This API is built with express.js framework and [Gasket](https://gasket.dev/). This application utilizes [EcmaScript Modules] and requires Node.js v20 or higher.

## Getting Started

### Development

To start the API locally, run:

```bash
cd {{{appName}}}
npm install
npm run local
```

### Debugging

To start the API locally with debugging enabled, run:

```bash
DEBUG=* npm run local
```

Extended filtering of the debug output can be achieved by adding to the `DEBUG` environment variable:

```bash
DEBUG=gasket:* npm run local // gasket operations only
DEBUG=express:* npm run local // express operations only
```

### Documentation

Generated docs will be placed in the `.docs` directory. To generate markdown documentation for the API, run:

```bash
npm run docs
```

### Docusaurus

When using [Docusaurus], generated docs will be available at `http://localhost:3000` when running the [Docusaurus] server. By default the Docusaurus server is started with the `docs` script. Add the `--no-view` option to only generate the markdown files.

### Definitions

Use `@swagger` JSDocs to automatically generate the [swagger.json] spec file. Visit [swagger-jsdoc] for examples.

### TypeScript

This API is built with TypeScript. To compile the TypeScript code, run:

```bash
npm run build
```

Use the `start` script to run the compiled code:

```bash
npm start
```

Run `build` and `start` together:

```bash
npm run preview
```

Compiled code will be placed in the `dist` directory. For local development, the [tsx] runtime is used and the watcher will be started automatically when running the `local` script.

#### ESM & TypeScript

A common workaround when using ESM in a TypeScript project with `"type": "module"` set in `package.json` is to import `.ts` files using the `.js` extension. For example:

```ts
import { myFunction } from './myModule.js';
```

Here, `myModule.ts` is the actual TypeScript file, but it's imported using the `.js` extension. TypeScript is able to resolve `myModule.ts` to `myModule.js`, making the import work at runtime.

For more information, see the extended documentation in the [Gasket TypeScript] doc and the [@gasket/plugin-typescript] package.


<!-- LINKS -->
[EcmaScript Modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
[Docusaurus]: https://docusaurus.io/
[tsx]: https://tsx.is/
[@gasket/plugin-typescript]: https://gasket.dev/docs/plugins/plugin-typescript/
[Gasket TypeScript]: https://gasket.dev/docs/typescript/
[swagger-jsdoc]: https://github.com/Surnet/swagger-jsdoc/
[swagger.json]: /swagger.json
