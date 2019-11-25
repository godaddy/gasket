# @gasket/utils

Reusable utilities for Gasket internals

## Installation

```bash
npm i @gasket/utils
```

## Functions

### tryRequire

Tries to require a module, but ignores if it is not found. If not found, result
will be null.

```js
const { tryRequire } = require('@gasket/utils');

let someConfig = tryRequire('../might/be/a/path/to/some/file');

if(!someConfig) {
  someConfig = require('./default-config')
}
```

### applyEnvironmentOverrides

Normalize the config by applying any environment or local overrides.

### runShellCommand

Promise friendly wrapper to running a shell command (eg: git, npm, ls).

- `runShellCommand(command[, args][, options])`

```js
const { runShellCommand } = require('@gasket/utils');

async function helloWorld() {
  await runShellCommand('echo', ['hello world']);
}
```
