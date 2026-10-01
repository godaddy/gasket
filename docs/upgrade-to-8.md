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

<!-- Links -->
[Switch Redux to GasketData]: upgrade-to-7.md#switch-redux-to-gasketdata
[Initialize Redux with GasketData]: upgrade-to-7.md#initialize-redux-with-gasketdata
[Switch to ESM (Optional)]: upgrade-to-7.md#switch-to-esm-optional

<!-- Packages -->
[@gasket/plugin-data]: /packages/gasket-plugin-data/README.md
[@gasket/data]: /packages/gasket-data/README.md
