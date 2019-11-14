# `@gasket/resolve`

### 2.0.1

- Fix to support Windows paths when resolving ([#105])

### 2.0.0

- Introduces [Loader] used to load configured presets and plugins ([#64]).
  - Presets no longer depend on this package nor resolve their own plugins.

### 1.5.0

- Align package structure and dependencies
- Supporting plugins named with a single letter.

### 1.4.0

- Including `package-identifier.js` and exposing new relative path resolve functions.

### 1.3.0

- [#8] Allow presets to extend other presets

### 1.2.0

- Prepare for Open Source release.

### 1.1.0

- Add docs from `@gasket/plugin-engine`. Create `pluginInfoFor` API.

### 1.0.0

- Initial release.

[#8]: https://github.com/godaddy/gasket/pull/8
[#64]: https://github.com/godaddy/gasket/pull/64
[#105]: https://github.com/godaddy/gasket/pull/105

[Loader]:/packages/gasket-resolve/README.md#Loader
