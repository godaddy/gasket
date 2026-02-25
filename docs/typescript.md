# TypeScript Guide

The Gasket team is dedicated to improving productivity for TypeScript users. Here are various tips to make TypeScript integration go smoothly.

## Ensuring Visibility of Plugin Extensions

Because Gasket is a plugin framework, plugins themselves are responsible for augmenting the core Gasket interfaces. This means that the type declarations for the plugins must be "discovered" in your TypeScript codebase. You can ensure this by referencing or importing your plugins. The sample code snippets below show these imports, but if you can centralize the imports in one area of your codebase, you can avoid duplication and ensure that TypeScript is aware of all the plugins.

## Validating Gasket Configuration

In Gasket, you can now write your `gasket.js` configuration file as `gasket.ts` using TypeScript. This allows for full type-checking and validation directly within your TypeScript environment.

The `@gasket/core` package supplies a `GasketConfigDefinition` type that validates the contents of your Gasket config file. When you import all your plugins into `gasket.ts`, TypeScript can fully validate the configuration.

Here's an example:

```typescript
// gasket.ts
import { makeGasket } from '@gasket/core';
import pluginA from '@gasket/plugin-a';
import pluginB from '@gasket/plugin-b';

export default makeGasket({
  plugins: [
    pluginA,
    pluginB
  ]
  // additional config
});
```

## Validating Lifecycle Hooks

The `@gasket/core` package supplies a `HookHandler` type that can be used to validate lifecycle hooks in plugins. It takes a string type parameter for the name of the lifecycle, ensuring that your hooks conform to the expected signature.

```typescript
import type { HookHandler } from '@gasket/core';

const intlLocaleHandler: HookHandler<'initLocale'> = (gasket, locale, { req, res }) => {
  return getLocaleFromHost(req.headers.host);
};

export default intlLocaleHandler;
```

With TypeScript, these plugin hooks can be directly authored in `.ts` files using the ESM syntax, allowing for smooth integration and type checking.

## Authoring Plugins

The `@gasket/core` package exports a `Plugin` type which can be used to validate your plugin definitions. If your plugin introduces additional configuration properties or lifecycles, you should extend the `GasketConfig` and `HookExecTypes` interfaces. Useful helper types can also be found in `@gasket/core`.

```typescript
// my-plugin.ts
import type {
  Plugin, GasketConfig, HookExecTypes, MaybeAsync
} from '@gasket/core';

const plugin: Plugin = {
  name: 'my-plugin',
  hooks: {
    express(gasket, app) {
      app.use(async (req, res, next) => {
        const customHeader = await gasket.execWaterfall(
          'customHeader',
          gasket.config.customHeader
        );

        if (customHeader) {
          res.set('x-silly-header', customHeader);
        }

        next();
      });
    }
  }
};

declare module '@gasket/engine' {
  export interface GasketConfig {
    customHeader?: string;
  }

  export interface HookExecTypes {
    customHeader(currentValue: string): MaybeAsync<string>;
  }
}

export default plugin;
```

## Conclusion

With Gasket, TypeScript users can now take full advantage of TypeScript’s type-checking capabilities by writing their `gasket.ts` configuration files and plugins in TypeScript using ESM syntax. This enhances the developer experience, ensuring that configurations and plugins are validated throughout the development process.
