# `@gasket/resolve`

### 6.44.1

- Fix partial package resolutions on Windows ([#653])

### 6.43.1

- Fix to handle windows path with tryRequire/Resolve ([#631])

### 6.41.0

- Add diagnostic logging for environment/config resolution when a
  `DEBUG=gasket:*` environment variable is set ([#607])

### 6.35.6

- Hard fail bad requires in gasket.config while preserving missing behavior
  ([#590])

### 6.35.0

- Allow for app-level cjs lifecyle & plugin files ([#482])

### 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

### 6.34.2

- Upgrade eslint-plugin-jest, update test methods to use canonical names
  ([#457])

### 6.30.2

- Fix TS options type ([#405])

### 6.29.0

- Moved loadGasketConfigFile and related functions ([#396])
- Memoize results from plugin loader ([#395])

### 6.15.2

- Handle missing package exports ([#333])

### 6.0.0

- Remove package name fallbacks ([#227])
- Upgraded dev dependencies ([#247])

### 5.3.1

- Validate that plugin objects are named ([#156])

### 5.1.0

- Expose projectIdentifier with support for scope-only package short names
  ([#142])
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

- Including `package-identifier.js` and exposing new relative path resolve
  functions.

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
[#227]: https://github.com/godaddy/gasket/pull/227
[#247]: https://github.com/godaddy/gasket/pull/247
[#333]: https://github.com/godaddy/gasket/pull/333
[#395]: https://github.com/godaddy/gasket/pull/395
[#396]: https://github.com/godaddy/gasket/pull/396
[#405]: https://github.com/godaddy/gasket/pull/405
[#436]: https://github.com/godaddy/gasket/pull/436
[#457]: https://github.com/godaddy/gasket/pull/457
[#482]: https://github.com/godaddy/gasket/pull/482
[#590]: https://github.com/godaddy/gasket/pull/590
[#607]: https://github.com/godaddy/gasket/pull/607
[#631]: https://github.com/godaddy/gasket/pull/631
[#653]: https://github.com/godaddy/gasket/pull/653

[Loader]:/packages/gasket-resolve/docs/api.md#loader
