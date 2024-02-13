# TypeScript Guide

The Gasket team is dedicated to improving productivity for TypeScript users. Here are various tips to make TypeScript integration go smoothly.

## Ensuring visibility of plugin extensions

Because Gasket itself is just a plugin framework, plugins themselves are responsible for augmenting the core Gasket interfaces. This means that the type declarations for the plugins have to be "discovered" in your TypeScript code base. This can be done by ensuring you reference or import your presets or plugins. The sample code snippets below show these imports, but if you can ensure TypeScript knows about all of the plugins from one centralized area of code then you can avoid duplication.

## Validating gasket.config.js

The `@gasket/engine` package supplies a `GasketConfigFile` type that, once you've also imported all your plugins, validates the contents of your gasket config file.

The `gasket.config.js` file cannot be written in TypeScript, but you can configure TypeScript to check JS files or use a `@ts-check` comment along with JSDoc type annotations. Due to JSDoc type checking limitations, you may have to separate the config declaration and your export:

```javascript
//@ts-check
///<reference types="@gasket/preset-nextjs"/>

/** @type {import('@gasket/engine').GasketConfigFile} */
const config = {
  plugins: {
    presets: ['@gasket/nextjs']
  },
  compression: true,
  http: 8080,
  intl: {
    defaultLocale: 'en-GB'
  }
};

module.exports = config;
```

## Validating lifecycle scripts

The `@gasket/engine` package supplies a `Hook` type that can be used to validate lifecycle scripts and plugin hooks. It takes a string type parameter for the name of the lifecycle.

```typescript
import { Hook } from '@gasket/engine';
import '@gasket/plugin-intl';

const intlLocaleHandler: Hook<'intlLocale'> = (gasket, locale, { req, res }) => {
  // return 3; - does not pass validation
  return getLocaleFromHost(req.headers.host);
}
```

Gasket does not currently allow you to author `/lifecycles/*` files in TypeScript. To add type checking to these scripts you must either write them in TypeScript and make sure they get compiled to JavaScript or use JSDoc comments to enable checking. Because of JSDoc limitations with generics syntax, writing in JavaScript requires a workaround using a separate `@typedef` declaration.

```javascript
// @ts-check
///<reference types="@gasket/plugin-intl"/>

/** 
 * @typedef {import('@gasket/engine').Hook<'intlLocale'>} IntlLocaleHandler
 */

/** @type {IntlLocaleHandler} */
const handler = (gasket, currentLocale, { req, res }) => {
  // return 3; - does not pass validation
  return getLocaleFromHost(req.headers.host);
};

module.exports = handler;
```

## Authoring plugins

The `@gasket/engine` package exports a `Plugin` type which can be used to validate your plugin definitions. If your plugin is introducing more config properties and lifecycles you should also extend the `GasketConfig` and `HookExecTypes` interfaces. Look for useful helper types in `@gasket/engine` as well.

```typescript
import type {
  Plugin, GasketConfig, HookExecTypes, MaybeAsync
} from '@gasket/engine';

// Ensure TypeScript knows about the lifecycles you're hooking
import '@gasket/plugin-express';

const plugin: Plugin = {
  name: "my-plugin",
  hooks: {
    middleware(gasket, express) {
      return [
        async (req, res, next) => {
          const headerValue = await gasket.execWaterfall(
            'customHeader',
            gasket.config.customHeader);

          if (customHeader) {
            res.set('x-silly-header', customHeader);
          }

          next();
        }
      ];
    }
  }
};

declare module '@gasket/engine' {
  export interface GasketConfig {
    customHeader?: string
  }

  export interface HookExecTypes {
    customHeader(currentValue: string): MaybeAsync<string>;
  }
}

export = plugin;
```
