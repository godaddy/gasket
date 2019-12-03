# @gasket/plugin-lint

Enables code style linting to be configured for Gasket apps.

## Installation

This plugin should only be used during the create command for new apps.

```
gasket create <app-name> --plugins @gasket/plugin-lint
```

Ideally, and for the most part, this plugin should already be included with
primary presets, so that the `--plugins` flag is not needed. See the [Presets]
section below to learn how preconfigure a code style.

## Usage

The features of this plugin hooks are in the lifecycles it hooks during the
create process.

### Prompts

During the create process, this plugin will prompt for selections to help choose
the linting configuration.

**Which code style do you want configured?**

Choices are:
- [GoDaddy]
- [Standard]
- [Airbnb]
- other - This allows manual eslint-config entry in the following prompt.
- none - This exits the create hook for the plugin.

**What is the name of the eslint config?**

If the code style chosen is _other_, the plugin will then prompt for the name of
an [ESLint shared config].

**Do you want stylelint configured?**

Some code style allow for [stylelint] to also be configured. Choose yes to
include config for it, also.

**What is the name of the stylelint config?**

If the previous prompt was yes, and the chosen code style is _other_, the plugin
will then prompt for the name of an ESLint [stylelint shared config].

### Scripts

Once completed, additional scripts will be added to the app's package for
linting; `lint` or `stylelint` or both. These can be run individually, and also
a `posttest` script is added so that linting will automatically run after `npm
test` or `yarn test`.

In the `postCreate` stage of the create command, the `lint:fix` script will be
run which will attempt to fixup any generated files to match the code style.
Sometimes, additional fixup may be required by the user, depending on the code
style and generated content. In these cases, a note will be added to the
warnings section of the create report display in the terminal.

## Code Styles

### GoDaddy

[GoDaddy JavaScript Style]

When choosing `godaddy` as the codeStyle, the eslint config will set up based on
what other packages are added for the app. These include `react`, `flow`,
`react` + `flow`, or otherwise just the base.

### Standard

[JavaScript Standard Style]

This will install the `standard` node binary and use it in the `lint` scripts.
There is no Standard stylelint config at this time.

### Airbnb

[Airbnb JavaScript Style]

When choosing `airbnb` as the codeStyle, the eslint config will set up based on
if `react` package is added for the app or not. If `react` is not present, the
base airbnb config will be used.

## Presets

To add this plugin to a preset, simply install it as a dependency.

```bash
npm i @gasket/plugin-lint
```

Presets can also pre-determine the code style to use. This is useful for teams
to avoid prompts and enforce a particular code style setup. This can be done in
the module for the preset, under a `createContext` property.

### Options

- `codeStyle` - (string) One of the choices of [code styles]:
  - `godaddy`
  - `standard`
  - `airbnb`
- `addStylelint` - (boolean) Enable to add stylelint for the `codeStyle` if set.
- `eslintConfig` - (string) Name of a [ESLint shared config] to add. Only when
  no `codeStyle`.
- `stylelintConfig` - (string) Name of a [stylelint shared config] to add. Only
  when no `codeStyle`.

For example, say we have some team that wants to always use [Airbnb] style and
with stylelint for their apps:

```js
// @some/gasket-preset-team-one.js
module.exports = {
  require,
  createContext: {
    codeStyle: 'airbnb',
    addStylelint: true
  }
};
```

Or, say we have another team with an internal [ESLint] config

```js
// @some/gasket-preset-team-two.js
module.exports = {
  require,
  createContext: {
    eslintConfig: '@another/eslint-config'
  }
};
```

## Contribute!

If there is an important and widely used code style that you feel would be a
good addition to the default choices of [Code Styles], reach out or submit a PR
with your suggestion.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[Code Styles]: #code-styles
[GoDaddy]: #godaddy
[Standard]: #standard
[Airbnb]: #airbnb
[Presets]: #presets

[ESLint]: https://eslint.org/
[stylelint]: https://stylelint.io/
[ESLint shared config]: https://eslint.org/docs/developer-guide/shareable-configs
[stylelint shared config]: https://stylelint.io/#extend-a-shared-configuration

[GoDaddy JavaScript Style]: https://github.com/godaddy/javascript#godaddy-style
[Airbnb JavaScript Style]: https://github.com/airbnb/javascript
[JavaScript Standard Style]: https://standardjs.com/
