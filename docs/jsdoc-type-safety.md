# Type Safety with JSDoc

This document aims to provide a comprehensive outline of our established pattern
for implementing type checking using JSDoc within the Gasket monorepo. Please
also feel free to leverage these patterns in your own applications and plugins.

## Problem

JavaScript, by itself, lacks static typing and strict type checking.

## Solution

To enhance type safety without migrating the codebase to TypeScript, we can
leverage a combination of JSDoc comments, TypeScript declaration files, and our
IDE's built-in type checker.

## Setup

1. Install `typescript` and `eslint-plugin-jsdoc` as dev dependencies:

```sh
npm i -D typescript eslint-plugin-jsdoc
```

2. Update ESLint config in your `package.json`:

```diff
// package.json

"eslintConfig": {
    "extends": [
      "godaddy",
      "plugin:jest/recommended",
+     "plugin:jsdoc/recommended-typescript-flavor"
    ],
    "plugins": [
      "unicorn",
+     "jsdoc"
    ],
    "rules": {
      "unicorn/filename-case": "error",
+     "valid-jsdoc": "off",
+     "spaced-comment": [
+       "error",
+       "always",
+       {
+         "markers": [
+           "/"
+         ]
+       }
+     ]
    }
  }
```

> There is currently an [open PR] on the `godaddy/javascript` repo to replace
> `valid-jsdoc` with `eslint-config-jsdoc`, as well as add support for
> typescript triple-slashes in js files. Once this PR is merged, the above
> example will be updated to reflect that change.

3. Add `tsconfig.json` to the root of your plugin:

```json
// tsconfig.json

{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    "skipLibCheck": false,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "lib": ["esnext", "dom"],
    "types": [
      "@types/jest"
    ]
  },
  "exclude": [
    "test"
  ]
}
```

These steps enable the built-in type checker in your IDE, allowing you to
identify and address type errors.

### Optional: Disable Type Checking For Tests

If the need arises to turn off type checking for test files, you have two
options.

1. You can add the exclusion property to the `tsconfig.json` to ignore all files
   in your `test` directory:

```json
{
  ...
"exclude": [
    "test"
  ]
  ...
}
```

2. If you are only wanting to ignore a single test file, you can use the
   `@ts-nocheck` flag at the top of your file.

## Usage

### Plugin Type

All root plugin definition files need to be decorated with the `@gasket/engine`
`Plugin` type.

```js
// index.js

/** @type {import('@gasket/engine').Plugin} */
const plugin = {
  name,
  hooks: {
    webpackConfig,
    getCommands,
  }
};

module.exports = plugin;
```

### `HookHandler`

If you are using individual lifecycle files, you will need to decorate each with
the specific `@gasket/engine` `HookHandler` type and description.

```js
/**
 * Add files & extend package.json for new apps.
 * @type {import('@gasket/engine').HookHandler<'create'>}
 */
module.exports = function create(gasket, context) {
  ...
}
```

### External Type References

If your lifecycle references types from other plugins, be sure to include the
typescript triple-slash directives. To learn more about these directives, see
the [typescriptlang docs]. We opted to include the references in the files
themselves instead of in the plugin's `tsconfig.json` to improve
readability/specificity.

```js
/// <reference types="@gasket/plugin-command" />
/// <reference types="@gasket/plugin-start" />
```

### `HookExecTypes`

If your plugin introduces new lifecycles, be sure to define all `HookExecTypes`
that your plugin calls, in the `types.d.ts` file.

```js
// example.js

await gasket.exec('express', app);
```

```ts
// types.d.ts

declare module '@gasket/engine' {
  export interface HookExecTypes {
      express(app: Application): MaybeAsync<void>;
      ...
  }
}
```

### `GasketConfig` Interface

If your plugin adds additional config properties to the `gasket.config.js`, be
sure to define those in the `.d.ts` file.

```js
// example.js

module.exports = function loadConfig(gasket) {
  const { root, configPath = 'config' } = gasket.config;

  const configDir = path.resolve(root, configPath);
  ...
}
```

```ts
// types.d.ts

declare module '@gasket/engine' {
  export interface GasketConfig {
    configPath?: string
  }
}
```

## FAQ

### `.HookHandler<'whatever'>` is erroring out. Why?

Be sure to reference the plugin that executes the gasket lifecycle you are
hooking:

```js
/// <reference types="@gasket/plugin-https" />
```

<!-- LINKS -->
[typescriptlang
    docs]:https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html
[open PR]: https://github.com/godaddy/javascript/pull/577
