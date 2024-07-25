# @gasket/plugin-typescript

Gasket plugin for TypeScript support.

## Installation


```shell
npm i @gasket/plugin-typescript
```

Modify `plugins` section of your `gasket.config.js`:

```diff
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginTypeScript from '@gasket/plugin-typescript';

export const gasket = makeGasket({
  plugins: [
+    pluginTypeScript
  ]
})
```

## Typescript & ESM

In order to support `type: module` applications with TypeScript imports need to include extensions. A workaround for the current state of ESM support is to utilize `.js` extensions in TypeScript files. This pattern may seem strange but the TypeScript compiler is able to resolve these imports and compile the code correctly.

```typescript
// server.ts

// Actual file is gasket.ts
import gasket from './gasket.js';
```
