# {appName}

## Overview

This application is built with [Gasket] and [Next.js] utilizing [EcmaScript Modules] and requires Node.js v20 or higher.

## Getting Started

### Development

To start the app locally, run:

```bash
cd {appName}
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

### Page Router

This Gasket app uses Next.js 14 with [Page Router] which relies on the traditional file-based routing within the pages directory. The integration with Next.js 14 leverages features like server-side rendering and static optimization, providing a streamlined development process and ensuring the app remains efficient and scalable.



### Custom Server

This Gasket app uses Next.js 14 Page Router with a [Custom Server] implementation. The Custom Server allows for more control over the server environment, enabling advanced features like custom routing, middleware, and server-side rendering. This integration enhances development by providing a flexible and scalable solution for building web applications.

### TypeScript & Custom Server

This Gasket app uses TypeScript with Next.js and a [Custom Server] for enhanced type safety and flexibility. A separate `tsc` process and `tsconfig.server` file are necessary to compile TypeScript code for the custom server and additional files. It’s essential to include root-level Gasket files in the Next.js TypeScript build and configure TypeScript aliases in the Next.js application to correctly import these Gasket TypeScript files into the Next.js application code. This setup ensures that all TypeScript code integrates smoothly and maintains strong type checking.

### Aliases

In Gasket apps that use TypeScript with Next.js [Page Router] and [Custom Server], it’s essential to configure TypeScript aliases to import Gasket TypeScript files correctly. The use-cases are as follows:

- `tsconfig.json` - Aliases for importing root-level Gasket files into application code.

Here is an example TypeScript plugin:

```ts
// plugins/my-cool-plugin.ts
export default {
  name: 'my-cool-plugin',
  hooks: {
    // hooks
  }
}
```

Import the TypeScript plugin in the `gasket.ts`:

```ts
// gasket.ts
import { makeGasket } from '@gasket/core';
import myCoolPlugin from './plugins/my-cool-plugin.ts';
```

The expectation would that the above import should work correctly but it does not. The absolute path import is not compiled or changes by the TypeScript compiler. The extensions are never changed and the cannot be left out due to the constraints with ESM.

Import the TypeScript plugin in the `gasket.ts` using the `.js` extension:

```ts
// gasket.ts
import { makeGasket } from '@gasket/core';
import myCoolPlugin from './plugins/my-cool-plugin.js';
```

This workaround allows TypeScript to resolve the `.ts` file to the `.js` file at runtime. The relative paths in the compiled `.js` files resolve correctly.

An example of importing a Gasket TypeScript file into Next.js application code:

```tsx
// index.tsx
import gasket from '@/gasket'; // preconfigured TypeScript alias

export default function Home() {
  return (
    <div>
      <h1>{gasket.config.coolValue}</h1>
    </div>
  );
}
```

For `.ts` Gasket files that need to be used in NextJS application code, be sure to configure the appropriate TypeScript aliases in the `tsconfig.json` file.


### Docusaurus

When using [Docusaurus], generated docs will be available at `http://localhost:3000` when running the [Docusaurus] server. By default the Docusaurus server is started with the `docs` script. Add the `--no-view` option to only generate the markdown files.

<!-- LINKS -->
[Gasket]: https://gasket.dev
[Next.js]: https://nextjs.org
[EcmaScript Modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
[tsx]: https://tsx.is/
[@gasket/plugin-typescript]: https://gasket.dev/docs/plugins/plugin-typescript/
[Gasket TypeScript]: https://gasket.dev/docs/typescript/
[Custom Server]: https://nextjs.org/docs/pages/building-your-application/configuring/custom-server
[Page Router]: https://nextjs.org/docs/pages
[Docusaurus]: https://docusaurus.io/
