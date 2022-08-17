# `@gasket/plugin-https`

- Add `hostname` config setting to type declarations

### 6.11.0

- Added healthcheck.html to terminus options. ([#315])

### 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

### 6.5.0

- Add support for http2 servers ([#287])

### 6.0.0

- Version alignment
- Upgraded dev dependencies ([#247])

### 5.1.3

- Set http fallbacks after createServer lifecycle ([#146])

### 5.0.1

- Update default http port ([#130])

### 5.0.0

- Open Source Release

### 2.2.1

- Handle permeations of [create-servers] callback ([#92])

### 2.2.0

- Graceful shutdown using [terminus] ([#90])

### 2.1.1

- Default to http port 80 when not configured and log start-up errors ([#79])

### 2.1.0

- Align package structure and dependencies

### 2.0.0

- [#23] Dismantling core-plugin
- [#7]: Initialize the `https-plugin`

[#7]: https://github.com/godaddy/gasket/pull/7
[#23]: https://github.com/godaddy/gasket/pull/23
[#79]: https://github.com/godaddy/gasket/pull/79
[#90]: https://github.com/godaddy/gasket/pull/90
[#92]: https://github.com/godaddy/gasket/pull/92
[#130]: https://github.com/godaddy/gasket/pull/130
[#146]: https://github.com/godaddy/gasket/pull/146
[#247]: https://github.com/godaddy/gasket/pull/247
[#287]: https://github.com/godaddy/gasket/pull/287
[#311]: https://github.com/godaddy/gasket/pull/311
[#315]: https://github.com/godaddy/gasket/pull/315

[terminus]: https://github.com/godaddy/terminus
[create-servers]: https://github.com/http-party/create-servers
