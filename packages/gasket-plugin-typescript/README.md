# @gasket/plugin-typescript

Gasket plugin for TypeScript support.

## Installation

#### Existing apps

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

