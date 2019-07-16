# CHANGELOG

- Separate express and next plugins from core

### 3.0.0

- Breakout https functionality from this plugin

### 2.10.0

- Remove internal SNI config

### 2.9.0

- Use GasketLogo from @gasket/assets

### 2.8.4
- webpack plugin will now pull name from package.json of app

### 2.8.3

- Use `url-join` to build modifyURLPrefix workbox option

### 2.8.2

- Allow `@gasket/log-plugin@3`
- Fix some security audit failures

### 2.8.0

- Added webpack plugin for metrics

### 2.7.1

- Disable x-powered-by header by default

### 2.7.0

- Gasket: nextConfig lifecycle

### 2.6.0

- Support for plain CSS files added

### 2.5.1

- Fix start hook to check gasket.command for local

### 2.5.0

- deprecating local hook; allowing build and start
  to run with `gasket local`.

### 2.4.1

- Ignore local only files

### 2.4.0

- Precache \_next files with Workbox
- Generate the gasket.config.js

### 2.3.1

- Use latest webpack and let analyze add its own script

### 2.3.0

- Updates to use next@8

### 2.2.1

- Fix import from styles

### 2.2.0

- Adds internal sni support for running locally

### 2.1.0

- Add `./styles` scaffolding with \_app.js scss imports which
  addresses routing bug.

### 2.0.2

- Updated the `generator` to ensure that `gasket create` now correctly includes
  the correct version of next and `@gasket/*` based packages.

### 2.0.1

- Now with correct peerDependencies versions for latest next and gasket log

### 2.0.0

- Upgrade to latest Next.js 7.0 which now requires `@babel/*` based
  packages as well as WebPack 4.0 based plugins.

### 1.3.0 - 1.3.1

- Introduced the `ssr` lifecycle to allow access to both `next` and `express`
  so you can manually render next responses if needed.

### 1.2.3

- Fix to always create with commonjs modules for preset-env

### 1.2.2

- Remove handlebar syntax that was caused by nested objects.

### 1.2.1

- Use `jspretty` syntax so `gasket create` generates files that actually
  pass the linter.
- Use default SNI for any gasket dev domain.

### 1.2.0

- Store additional plugins in the `gasket.config.js`
- Lint the `generator/*` files so we pass the `npm lint` on initial `gasket create`

### 1.1.4

- Only require `webpack` when it's needed.

### 1.1.3

- Support `null` as listener in the config to disable creation of servers
- Prevent useless `webpack` calls.

### 1.1.2

- Included better SNI defaults

### 1.1.1

- Move `generator/.gitattributes` to `generator/.gitattributes.template` to
  appease `npm pack` for publishing.

### 1.1.0

- Create hook support.

### 1.0.0

- Initial release.
