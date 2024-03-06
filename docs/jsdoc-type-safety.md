# Type Safety with JSDoc

## Problem

JavaScript, by itself, lacks static typing and strict type checking.

## Solution

To enhance type safety without migrating the codebase to TypeScript, leverage a
combination of JSDoc comments, TypeScript declaration files, and your IDE's
built-in type checker.

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

## Tips & Tricks

A helpful starting point is to add the Plugin type definition to your
`index.js`:

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

## FAQ

### Does your plugin call any `gasket.exec` methods?

Ensure you define `HookExecTypes` in your `.d.ts` file:

```ts
// example.d.ts

export interface HookExecTypes {

}
```

### `.HookHandler<'whatever'>` is erroring out. Why?

Locate the plugin that initially `gasket.execs` this lifecycle and include the
type reference:

```js
/// <reference types="@gasket/plugin-https" />
```
