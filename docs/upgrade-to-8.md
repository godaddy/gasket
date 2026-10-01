# Upgrade to v8 (Active)

This guide will take you through updating `@gasket/*` packages to `8.x`.

Gasket 8 is a cleanup release: it drops the deprecated and create-only
packages, ships ESM only, and moves the baseline runtime to Node 24 with
native TypeScript, React 19, Next.js 16 and Fastify 5. Each section below is
one breaking change with the migration step for it.

## Table of Contents

- [Update Dependency Versions](#update-dependency-versions)
- [Removed Packages](#removed-packages)
  - [Redux](#redux)
  - [Presets and create-only plugins](#presets-and-create-only-plugins)
  - [Manifest, Service Worker and Workbox](#manifest-service-worker-and-workbox)
- [Switch to ESM](#switch-to-esm)
- [Presets Are Now Templates](#presets-are-now-templates)
  - [Update create-gasket-app Scripts](#update-create-gasket-app-scripts)
  - [Remove Create-Time Hooks from Plugins](#remove-create-time-hooks-from-plugins)
- [Replace the middleware Lifecycle](#replace-the-middleware-lifecycle)
  - [Express](#express)
  - [Fastify](#fastify)
  - [Middleware Ordering](#middleware-ordering)
- [Fastify 5](#fastify-5)
- [Node 24 and TypeScript at Runtime](#node-24-and-typescript-at-runtime)
  - [Remove tsx](#remove-tsx)
  - [Update tsconfig](#update-tsconfig)
- [React 19 and Next.js 16](#react-19-and-nextjs-16)
  - [Webpack or Turbopack](#webpack-or-turbopack)
- [Removed Deprecated APIs](#removed-deprecated-apis)
- [Remove @gasket/fetch](#remove-gasketfetch)

## Update Dependency Versions

Gasket 8 requires Node `>=24`. Update the `engines` field and your CI /
deploy images first; several of the other changes in this guide (ESM-only
packages, TypeScript at runtime) depend on it.

```diff
"engines": {
-  "node": ">=20"
+  "node": ">=24"
}
```

Then update all `@gasket` scoped packages to the v8 major version, and the
framework packages they now require. This is not an exhaustive list, but
rather a sampling of dependencies to demonstrate what to look for:

```diff
"dependencies": {
-    "@gasket/core": "^7.5.0",
+    "@gasket/core": "^8.0.0",
-    "@gasket/plugin-nextjs": "^7.5.0",
+    "@gasket/plugin-nextjs": "^8.0.0",
-    "@gasket/plugin-fastify": "^7.5.0",
+    "@gasket/plugin-fastify": "^8.0.0",
-    "react": "^18.3.1",
+    "react": "^19.0.0",
-    "react-dom": "^18.3.1",
+    "react-dom": "^19.0.0",
-    "next": "^15.0.0",
+    "next": "^16.0.0",
-    "fastify": "^4.29.1",
+    "fastify": "^5.0.0"
}
```

Framework versions supported by the v8 plugins:

| Package                 | Supports                              |
| :---------------------- | :------------------------------------ |
| `@gasket/plugin-nextjs` | `next` `>=16.1.6 <17` (peer)          |
| `@gasket/nextjs`        | `next` 16, `react` / `react-dom` 19   |
| `@gasket/react-intl`    | `react` 19                            |
| `@gasket/plugin-fastify`| `fastify` `^4.29.1 \|\| ^5`           |
| `@gasket/plugin-express`| `express` 4                           |

Once the dependency list is updated, remove every package listed in
[Removed Packages](#removed-packages) before running `npm install`; several of
them will not resolve at `^8.0.0`.

## Removed Packages

Sixteen packages are not published at v8. Remove them from `package.json`,
from the `plugins` array in `gasket.js`, and delete their config blocks.

| Removed package                 | What to do in v8                                                            |
| :------------------------------ | :-------------------------------------------------------------------------- |
| `@gasket/cjs`                   | Nothing to install. See [Switch to ESM](#switch-to-esm).                    |
| `@gasket/redux`                 | App-owned store. See [Redux](#redux).                                       |
| `@gasket/plugin-redux`          | App-owned store. See [Redux](#redux).                                       |
| `@gasket/preset-api`            | `create-gasket-app --template @gasket/template-api-express` (or `-fastify`) |
| `@gasket/preset-nextjs`         | `create-gasket-app --template @gasket/template-nextjs-pages` (or `-app`, `-express`) |
| `@gasket/plugin-cypress`        | Add your own test runner; templates ship `vitest`.                           |
| `@gasket/plugin-jest`           | Add your own test runner; templates ship `vitest`.                           |
| `@gasket/plugin-mocha`          | Add your own test runner; templates ship `vitest`.                           |
| `@gasket/plugin-vitest`         | Install `vitest` directly; templates ship `vitest.config.js`.               |
| `@gasket/plugin-lint`           | Install `eslint` `^9` directly; templates ship an `eslint.config.js`.       |
| `@gasket/plugin-git`            | `create-gasket-app` runs `git init` itself.                                 |
| `@gasket/plugin-typescript`     | Node 24 runs `.ts` natively; templates ship a `tsconfig.json`.              |
| `@gasket/plugin-manifest`       | None. Serve a static `manifest.json` from your app.                          |
| `@gasket/plugin-service-worker` | None. App-owned service worker.                                             |
| `@gasket/plugin-workbox`        | None. App-owned Workbox config.                                             |
| `@gasket/plugin-middleware`     | `express` / `fastify` lifecycle hooks (`@gasket/plugin-express`, `@gasket/plugin-fastify`). |

A `gasket.js` that used several of them looks like this after the removal:

```diff
import { makeGasket } from '@gasket/core';
import pluginNextjs from '@gasket/plugin-nextjs';
- import pluginMiddleware from '@gasket/plugin-middleware';
- import pluginRedux from '@gasket/plugin-redux';
- import pluginManifest from '@gasket/plugin-manifest';
- import pluginServiceWorker from '@gasket/plugin-service-worker';
- import pluginWorkbox from '@gasket/plugin-workbox';
- import pluginJest from '@gasket/plugin-jest';
- import pluginLint from '@gasket/plugin-lint';
- import pluginTypescript from '@gasket/plugin-typescript';

export default makeGasket({
  plugins: [
    pluginNextjs,
-    pluginMiddleware,
-    pluginRedux,
-    pluginManifest,
-    pluginServiceWorker,
-    pluginWorkbox,
-    pluginJest,
-    pluginLint,
-    pluginTypescript
  ],
-  redux: {
-    makeStore: './redux/store.js'
-  },
-  manifest: { name: 'My App' },
-  serviceWorker: { url: '/sw.js' },
-  workbox: { config: {} }
});
```

### Redux

`@gasket/redux` and `@gasket/plugin-redux` were deprecated in v7 and are
removed in v8. There is no Gasket-owned Redux story anymore: Gasket surfaces
config-like data to the browser through [@gasket/plugin-data] and
[@gasket/data] instead, which works with both the Next.js App Router and Pages
Router.

If you were only using Redux to carry Gasket config to the client, finish the
[Switch Redux to GasketData] migration from the v7 guide and delete the store.

If your app has other reasons to keep Redux, own the store yourself:

- Install `redux`, `react-redux` and (for Next.js) `next-redux-wrapper`
  directly.
- Replace the `redux.makeStore` config and the `initReduxState` /
  `initReduxStore` lifecycles with a plain store module imported by your
  `_app.js` or root layout.
- Load public Gasket data into the store with
  `gasket.actions.getPublicGasketData(req)` as shown under
  [Initialize Redux with GasketData] in the v7 guide.

### Presets and create-only plugins

`@gasket/preset-api`, `@gasket/preset-nextjs` and the plugins that only did
work at `create` time (`-git`, `-lint`, `-jest`, `-mocha`, `-cypress`,
`-typescript`, `-vitest`) are replaced by `@gasket/template-*` packages: a
complete, runnable app that `create-gasket-app` copies into place. The
templates already contain the tooling those plugins used to generate
(`vitest`, `eslint` `^9` flat config, `tsconfig.json`, `.gitignore`).

Existing apps are unaffected at runtime; just remove the packages. Plugin
authors that hooked `prompt`, `create` or `postCreate` must delete those hooks.

### Manifest, Service Worker and Workbox

`@gasket/plugin-manifest`, `@gasket/plugin-service-worker` and
`@gasket/plugin-workbox` were deprecated in v7 and have no v8 replacement.
Delete the `manifest`, `serviceWorker` and `workbox` config blocks and the
`manifest`, `composeServiceWorker`, `serviceWorkerCacheKey`,
`getSWRegisterScript` and `workbox` lifecycle hooks. If you still need a web
manifest or a service worker, serve them as static files from your app (for
Next.js, from `public/`) and register the worker from your own client code.

## Switch to ESM

Every `@gasket/*` package is published as ESM only. The `exports.require`
entries and the `cjs/*.cjs` builds that `@gasket/cjs` produced are gone.
`require('@gasket/<anything>')` from a CommonJS file now resolves the ESM
entry and only works through Node's `require(esm)` support, which is not a
supported way to consume Gasket: Gasket's examples, templates and types all
assume your app is ESM.

If your app is still CommonJS, flip it now:

```diff
// package.json
{
+  "type": "module"
}
```

```diff
- const { makeGasket } = require('@gasket/core');
- const pluginNextjs = require('@gasket/plugin-nextjs');
+ import { makeGasket } from '@gasket/core';
+ import pluginNextjs from '@gasket/plugin-nextjs';

- module.exports = makeGasket({
+ export default makeGasket({
  plugins: [pluginNextjs]
});
```

Things to check once `"type": "module"` is set:

- Any remaining `.js` file that still uses `require` / `module.exports` must be
  renamed to `.cjs`, or converted.
- Relative imports need file extensions (`./plugins/routes.js`, not
  `./plugins/routes`).
- `__dirname` / `__filename` become `import.meta.dirname` /
  `import.meta.filename` (available on Node 24).
- Config files read by other tools (`next.config.js`, `vitest.config.js`,
  `eslint.config.js`) are now ESM as well; export with `export default`.

The v7 guide's [Switch to ESM (Optional)] section has more detail; in v8 the
step is no longer optional.

## Presets Are Now Templates

`@gasket/preset-api` and `@gasket/preset-nextjs` are gone, and with them the
prompt-driven `create-gasket-app` flow. A v8 template is a complete app that
`create-gasket-app` copies, renames and installs; there are no prompts and
no plugin-contributed `create` steps.

Official templates:

| Template                           | Scaffolds                                   |
| :--------------------------------- | :------------------------------------------ |
| `@gasket/template-nextjs-pages`    | Next.js Pages Router with Gasket HTTPS proxy |
| `@gasket/template-nextjs-app`      | Next.js App Router with Gasket HTTPS proxy   |
| `@gasket/template-nextjs-express`  | Next.js Pages Router on a custom Express server |
| `@gasket/template-api-express`     | Express API                                  |
| `@gasket/template-api-fastify`     | Fastify 5 API                                |

### Update create-gasket-app Scripts

`--template <package[@version]>` is now required. Replace `--presets` with it
and drop the other removed flags: `--preset-path`, `--config`,
`--config-file`, `--no-prompts`, `--require` and `--npm-link`. Only
`--template`, `--template-path` (a local directory, for template development)
and `--package-manager` remain.

```diff
- npx create-gasket-app@latest my-app --presets @gasket/preset-nextjs --no-prompts
+ npx create-gasket-app@latest my-app --template @gasket/template-nextjs-pages
```

```diff
- npx create-gasket-app@latest my-api --presets @gasket/preset-api --config '{"server":"fastify"}'
+ npx create-gasket-app@latest my-api --template @gasket/template-api-fastify --package-manager pnpm
```

Anything a preset used to decide from prompt answers (TypeScript, test runner,
linting, server flavor) is a choice of template instead. To customize what new
apps start with, publish your own `template-*` package: the only contract is a
`template/` directory that `create-gasket-app` copies, with `{{{appName}}}`
placeholders in `package.json`.

### Remove Create-Time Hooks from Plugins

The `prompt`, `create` and `postCreate` lifecycles no longer exist, and the
`CreateContext` / `CreatePrompt` types that described them are removed from
`create-gasket-app`, `@gasket/plugin-nextjs` and `@gasket/plugin-swagger`.
Plugins that implemented them still load (unknown hooks are ignored), but the
code is dead; delete it along with any `create-gasket-app` devDependency the
plugin kept for the types.

```diff
export default {
  name: 'my-plugin',
  hooks: {
-    prompt(gasket, context, { prompt }) { /* ... */ },
-    create(gasket, context) { /* ... */ },
-    postCreate(gasket, context) { /* ... */ },
    express(gasket, app) { /* ... */ }
  }
};
```

Move whatever those hooks generated (files, `package.json` entries, scripts)
into a template instead.

## Replace the middleware Lifecycle

`@gasket/plugin-middleware` is removed, and the `middleware` lifecycle with
it. Plugins register middleware directly on the framework instance in the
`express` or `fastify` lifecycle, which `@gasket/plugin-express` and
`@gasket/plugin-fastify` already provided for routes. `@gasket/plugin-nextjs`
hooks the same lifecycles, so a Next.js app with a custom server needs no
extra plugin.

Also gone with the plugin:

- The `middleware` config array (plugin-to-path mapping) and the
  `middlewareInclusionRegex`, `excludedRoutesRegex`, `compression` and
  `routes` options under `express` / `fastify`. Scope middleware yourself with
  `app.use('/path', fn)` (Express) or an `onRequest` hook with a URL check
  (Fastify), and add compression with the `compression` package or
  `@fastify/compress` in the same hook.
- `@fastify/express`, which the plugin pulled in to run Express-style
  middleware on Fastify. Use Fastify hooks and plugins instead.
- The request-scoped `req.logger` the plugin attached. Use `gasket.logger`
  in your handlers.

`fastify.trustProxy` is still read by `@gasket/plugin-fastify`; see
[Fastify 5](#fastify-5) for the value to use. `@gasket/plugin-express` has
no `trustProxy` option; call `app.set('trust proxy', ...)` in an `express`
hook.

### Express

```diff
export default {
  name: 'my-plugin',
  hooks: {
-    middleware(gasket) {
-      return [xssProtection(), myAuth(gasket)];
-    }
+    express(gasket, app) {
+      app.use(xssProtection());
+      app.use(myAuth(gasket));
+    }
  }
};
```

```diff
// gasket.js
- import pluginMiddleware from '@gasket/plugin-middleware';
import pluginExpress from '@gasket/plugin-express';

export default makeGasket({
  plugins: [
-    pluginMiddleware,
    pluginExpress
  ],
-  express: {
-    compression: true,
-    middlewareInclusionRegex: /^(?!\/_next\/)/
-  }
});
```

### Fastify

Express-style `(req, res, next)` middleware does not run on Fastify 5 without
`@fastify/express`. Convert it to Fastify hooks or plugins:

```diff
export default {
  name: 'my-plugin',
  hooks: {
-    middleware(gasket) {
-      return [xssProtection(), myAuth(gasket)];
-    }
+    async fastify(gasket, app) {
+      await app.register(fastifyHelmet, { xssFilter: true });
+      app.addHook('onRequest', async (request, reply) => {
+        await myAuth(gasket, request, reply);
+      });
+    }
  }
};
```

### Middleware Ordering

The `middleware` lifecycle ran before routes by construction. The `express` /
`fastify` lifecycles fire in plugin order, so a middleware plugin listed after
a routes plugin never sees the request. Either list middleware plugins first
in `gasket.js`, or make the hook independent of ordering with
`timing: { first: true }`:

```js
export default {
  name: 'my-middleware-plugin',
  hooks: {
    express: {
      timing: { first: true },
      handler(gasket, app) {
        app.use(myMiddleware());
      }
    }
  }
};
```

See [Middleware not intercepting requests due to plugin order] in the
`@gasket/plugin-express` gotchas for the full discussion.

## Fastify 5

`@gasket/plugin-fastify` targets Fastify 5 and creates the server through a
version adapter, so `fastify@^4.29.1` keeps working during the transition;
`@gasket/template-api-fastify` scaffolds Fastify 5. Follow the
[Fastify v5 migration guide] for Fastify's own breaking changes, and check that
every `@fastify/*` plugin you install has a Fastify 5 release
(`@gasket/plugin-swagger` accepts `@fastify/swagger` `^9` and
`@fastify/swagger-ui` `^6`).

```diff
"dependencies": {
-    "fastify": "^4.29.1",
+    "fastify": "^5.0.0",
-    "@fastify/swagger": "^8.15.0",
+    "@fastify/swagger": "^9.0.0",
-    "@fastify/swagger-ui": "^4.2.0",
+    "@fastify/swagger-ui": "^6.0.0"
}
```

One Gasket-specific change: `fastify.trustProxy` must not be a hop count.
Fastify 5 treats a number as "trust no proxy", so `request.ip` silently falls
back to the socket peer. Use the proxy's address list instead, which behaves
the same on Fastify 4 and 5. `true` is also discouraged: it trusts the whole
`X-Forwarded-For` chain and lets a client spoof `request.ip`.

```diff
export default makeGasket({
  plugins: [pluginFastify],
  fastify: {
-    trustProxy: 1
+    trustProxy: ['10.0.0.0/8'] // the load balancer's network
  }
});
```

See [Fastify Version Support] and [trustProxy] in the `@gasket/plugin-fastify`
README.

## Node 24 and TypeScript at Runtime

Gasket 8 requires Node 24, and uses its built-in TypeScript support (type
stripping) instead of a loader. `gasket.ts`, `server.ts` and your plugins run
directly with `node`; `@gasket/plugin-typescript` and `tsx` are gone from the
templates. `create-gasket-app` and the templates declare `engines.node >=24`.

```diff
"engines": {
-  "node": ">=20"
+  "node": ">=24"
},
"scripts": {
-  "build": "tsx gasket.ts build",
-  "start": "tsx server.ts",
-  "local": "tsx watch server.ts",
+  "build": "node gasket.ts build",
+  "start": "node server.ts",
+  "local": "node --watch server.ts",
+  "docs": "node gasket.ts docs"
}
```

### Remove tsx

Delete `tsx` (and `ts-node`, `@swc-node/register` or similar) from
`devDependencies`, the `--import tsx` / `--loader` flags from `NODE_OPTIONS`
and scripts, and `@gasket/plugin-typescript` from `gasket.ts`. Node needs no
flags to run `.ts` files on 24.

### Update tsconfig

Node strips types; it does not transform them. Two consequences for your
`tsconfig.json`:

- Relative imports of TypeScript files must use the real `.ts` extension
  (`import gasket from './gasket.ts'`). Set `allowImportingTsExtensions: true`
  (requires `noEmit: true`), and use `module` / `moduleResolution`
  `NodeNext` (or `bundler` for Next.js apps where Next does the bundling).
- Syntax that needs code generation is rejected at runtime: `enum`,
  `namespace`, parameter properties, `import x = require()`. Set
  `erasableSyntaxOnly: true` (TypeScript 5.8+) so `tsc` flags them, and
  replace enums with `as const` objects.

```diff
{
  "compilerOptions": {
+    "module": "NodeNext",
+    "moduleResolution": "NodeNext",
+    "allowImportingTsExtensions": true,
+    "erasableSyntaxOnly": true,
+    "noEmit": true,
    "strict": false
  }
}
```

Type checking is a separate `tsc --noEmit` step you run yourself; `node`
never reports type errors. See the [TypeScript guide] for the full template
setup.

## React 19 and Next.js 16

`@gasket/plugin-nextjs` and `@gasket/nextjs` require Next.js 16
(`next >=16.1.6 <17` is a peer dependency of both), and the templates,
`@gasket/react-intl` and `@gasket/assets` are built against React 19. Next 15
and React 18 are not supported.

```diff
"dependencies": {
-    "next": "^15.1.0",
+    "next": "^16.1.6",
-    "react": "^18.3.1",
+    "react": "^19.0.0",
-    "react-dom": "^18.3.1",
+    "react-dom": "^19.0.0"
}
```

Follow the [React 19 upgrade guide] and the [Next.js 16 upgrade guide] for the
framework-level changes (`next/codemod` covers most of them). The Gasket side
is unchanged: `useGasketData`, `GasketDataProvider`, `withGasketDataProvider`,
`withLocaleInitialProps` and `injectGasketData` keep their signatures, and
`next.config.js` still exports the `getNextConfig` action. With TypeScript at
runtime that file imports `gasket.ts` directly:

```js
// next.config.js
const gasket = (await import('./gasket.ts')).default;
export default gasket.actions.getNextConfig();
```

### Webpack or Turbopack

Next.js 16 defaults to Turbopack, and Turbopack ignores the Webpack
configuration that `@gasket/plugin-nextjs` and `@gasket/plugin-webpack`
inject. Pick one:

- Keep Webpack: add `--webpack` to `next dev` and `next build`. This is what
  the templates do.
- Opt into Turbopack: set `turbopack: true` in `makeGasket()`. The plugin then
  drops its Webpack callback and registers `@gasket/core` and
  `@gasket/plugin-nextjs` under `serverExternalPackages`; any other plugin
  that contributed Webpack config needs its own `nextConfig` hook, and
  app-level aliases move to Next's `turbopack.resolveAlias`.

```diff
"scripts": {
-  "local": "next dev",
-  "build": "next build",
+  "local": "next dev --webpack",
+  "build": "next build --webpack"
}
```

See [Next.js 16 bundlers] in the `@gasket/plugin-nextjs` README.

## Removed Deprecated APIs

APIs that were marked `@deprecated` in v7 with a named replacement are
removed in v8:

| Removed                                              | Package                 | Use instead                                                        |
| :--------------------------------------------------- | :---------------------- | :----------------------------------------------------------------- |
| `gasket.actions.getExpressApp()`                     | `@gasket/plugin-express`| The `express(gasket, app)` lifecycle receives the app instance.    |
| `gasket.actions.getFastifyApp()`                     | `@gasket/plugin-fastify`| The `fastify(gasket, app)` lifecycle receives the app instance.    |
| `request()` from `@gasket/nextjs/server` (sync)      | `@gasket/nextjs`        | `import { request } from '@gasket/nextjs/request'` (async, returns a `GasketRequest`). |
| `GasketConfig.next` type                             | `@gasket/plugin-nextjs` | `nextConfig`. The runtime never read `next`; only the type is gone. |
| `middleware` lifecycle                               | `@gasket/plugin-middleware` | See [Replace the middleware Lifecycle](#replace-the-middleware-lifecycle). |
| `prompt` / `create` / `postCreate` lifecycles        | `create-gasket-app`     | See [Remove Create-Time Hooks from Plugins](#remove-create-time-hooks-from-plugins). |

```diff
- import { request } from '@gasket/nextjs/server';
+ import { request } from '@gasket/nextjs/request';

export default async function Page() {
-  const req = request();
+  const req = await request();
  const data = await gasket.actions.getPublicGasketData(req);
  // ...
}
```

```diff
export default {
  name: 'my-plugin',
  hooks: {
-    async someLifecycle(gasket) {
-      const app = await gasket.actions.getExpressApp();
-      app.use(myMiddleware());
-    }
+    express(gasket, app) {
+      app.use(myMiddleware());
+    }
  }
};
```

Still deprecated, not yet removed at the time of writing: the legacy
`GasketRequest` interface exported from `@gasket/core`. Import the class from
`@gasket/request` instead (`import type { GasketRequest } from
'@gasket/request'`); the `@gasket/core` export is scheduled for removal and
collides with the `@gasket/request` name in TypeScript.

## Remove @gasket/fetch

`@gasket/fetch` was deprecated in v7 and is not published at v8. Node 24 and
every supported browser provide the Fetch API globally, so drop the import and
the dependency:

```diff
- import fetch from '@gasket/fetch';

const res = await fetch('url/to/resource');
```

```diff
"dependencies": {
-    "@gasket/fetch": "^7.0.0"
}
```

<!-- Links -->
[Switch Redux to GasketData]: upgrade-to-7.md#switch-redux-to-gasketdata
[Initialize Redux with GasketData]: upgrade-to-7.md#initialize-redux-with-gasketdata
[Switch to ESM (Optional)]: upgrade-to-7.md#switch-to-esm-optional
[Middleware not intercepting requests due to plugin order]: /packages/gasket-plugin-express/docs/gotchas.md#middleware-not-intercepting-requests-due-to-plugin-order
[Fastify Version Support]: /packages/gasket-plugin-fastify/README.md#fastify-version-support
[trustProxy]: /packages/gasket-plugin-fastify/README.md#trustproxy
[Fastify v5 migration guide]: https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/
[TypeScript guide]: typescript.md
[React 19 upgrade guide]: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
[Next.js 16 upgrade guide]: https://nextjs.org/docs/app/guides/upgrading/version-16
[Next.js 16 bundlers]: /packages/gasket-plugin-nextjs/README.md#nextjs-16-bundlers-webpack--opt-in-turbopack

<!-- Packages -->
[@gasket/plugin-data]: /packages/gasket-plugin-data/README.md
[@gasket/data]: /packages/gasket-data/README.md
