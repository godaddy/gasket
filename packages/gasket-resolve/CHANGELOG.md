# `@gasket/resolve`

### 5.3.1

- Validate that plugin objects are named ([#156])

### 5.1.0

- Expose projectIdentifier with support for scope-only package short names ([#142])
- Clean markdown from jsdocs ([#141])

### 5.0.0

- Open Source Release
- Support for project-type prefixed naming of plugins and presets ([#93])

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
[#93]: https://github.com/godaddy/gasket/pull/93
[#105]: https://github.com/godaddy/gasket/pull/105
[#141]: https://github.com/godaddy/gasket/pull/141
[#142]: https://github.com/godaddy/gasket/pull/142
[#156]: https://github.com/godaddy/gasket/pull/156

[Loader]:/packages/gasket-resolve/docs/api.md#loader
