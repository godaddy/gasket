# @gasket/utils

Reusable utilities for Gasket internals

## Installation

```bash
npm i --save @gasket/utils
```

## Functions

### tryRequire

Tries to require a module, but ignores if it is not found. If not found,
result will be null.

```js
const { tryRequire } = require('@gasket/utils');

let someConfig = tryRequire('../might/be/a/path/to/some/file');

if(!someConfig) {
  someConfig = require('./default-config')
}
```

### applyEnvironmentOverrides

Normalize the config by applying any environment or local overrides.
