# Type Safety with JSDoc

## Problem

JavaScript, by itself, lacks static typing and strict type checking.

## Solution

To enhance type safety without migrating the codebase to TypeScript, we can
leverage a combination of JSDoc comments, TypeScript declaration files, and our
IDE's built-in type checker.

## Steps to Add JSDoc Type Checking to a Gasket Plugin

1. Install `typescript` and `eslint-plugin-jsdoc` as dev dependencies:

```sh
npm i -D typescript eslint-plugin-jsdoc
```

<!-- TODO: Update this section and all of the plugins after the eslint-config-godaddy PR has been merged  -->
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

3. Add `tsconfig.json` to the root of your plugin:

```json
// tsconfig.json

{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
  },
  "include": [
    "lib/**/*.js",
    "lib/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

These steps enable the built-in type checker in your IDE, allowing you to
identify and address type errors.

## Standards

All root plugin definition files need to be decorated with the `@gasket/engine`
Plugin type.

```js
// index.js

/** @type {import('@gasket/engine').Plugin} */
module.exports = {
  name,
  hooks: {
    webpackConfig,
    getCommands,
  }
};
```

Each lifecycle file needs to be decorated with the specific `@gasket/engine`
`HookHandler` type and description.

```js
/**
 * Add files & extend package.json for new apps.
 * @type {import('@gasket/engine').HookHandler<'create'>}
 */
module.exports = function create(gasket, context) {
  ...
}
```

If your lifecycle references types from other plugins, be sure to include the
typescript triple-slash directives. To learn more about these directives, see
the [typescriptlang docs].

```js
/// <reference types="@gasket/plugin-command" />
/// <reference types="@gasket/plugin-start" />
```

Define all `HookExecTypes` that your plugin calls, in the `types.d.ts` file.

```js
// example.js

await gasket.execApply('middleware', async (plugin, handler) => {
  ...
}
```

```ts
// types.d.ts

declare module '@gasket/engine' {
  export interface HookExecTypes {
      middleware(app: Application): MaybeAsync<MaybeMultiple<Handler>>;
      ...
  }
}
```

If your plugin adds additional config properties to the `gasket.config.js`, be sure to define those in the `.d.ts` file.

```js
// example.js

module.exports = async function createServers(gasket, serverOpts) {
  ...
  gasket.config.exampleConfigProperty = true;
  ...
}
```

```ts
// types.d.ts

declare module '@gasket/engine' {
  export interface GasketConfig {
    exampleConfigProperty: boolean
  }
}
```

## FAQ

### `.HookHandler<'whatever'>` is erroring out. Why?

Locate the plugin that initially `gasket.execs` this lifecycle and include the
type reference:

```js
/// <reference types="@gasket/plugin-https" />
```

<!-- LINKS -->
[typescriptlang docs]:
    (https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html)
