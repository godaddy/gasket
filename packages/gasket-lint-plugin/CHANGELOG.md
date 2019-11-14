# `@gasket/lint-plugin`

### 2.0.0

- Refactored to prompt for code styles and allow custom ESLint or stylelint configs to be set. ([#98])
  - Supported code styles: [GoDaddy], [Standard], [Airbnb]

### 1.7.3

- Fix package.json scripts to wrap glob patterns in double-quotes
- Change output for `stylelint` script to have the glob pattern be double-quoted

### 1.7.0

- Changed package manager install to support both npm and yarn

### 1.6.0

- Run `lint` and `stylelint` in gasket's `postCreate` lifecycle

### 1.5.1

- Override `jsx-a11y/anchor-is-valid` for next/link.

### 1.5.0

- Upgrades to create dependencies with jsx-a11y plugin.

### 1.4.0

- Upgrades to dependencies in create hook.

### 1.3.0

- Include jsx files.
- Add stylelint during create hook.

### 1.2.0

- Catch all pattern with ignores.

### 1.1.0

- Move eslint settings to package.json.

### 1.0.0

- Initial release.

[GoDaddy]: README.md#godaddy
[Standard]: README.md#standard
[Airbnb]: README.md#airbnb

[#98]: https://github.com/godaddy/gasket/pull/98
