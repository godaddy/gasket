# `@gasket/cli`

- Use Loader for presets during create ([#66])
  - Presets can export createContext from module
  - `PresetInfo`s for loaded modules available on createContext
- Enable metadata for create hooks ([#64])

### 2.6.1

- Prevent multiple gasket instances from accessing the same data ([#58])

### 2.6.0

- Align package structure and dependencies
- Use `metadata` plugin by default

### 2.5.0

- Moving `package-identifier.js` to `@gasket/resolve`.

### 2.4.0

- Able to define default plugins

### 2.3.0

- [#34] Support for setting cli version in apps
  - Created apps have cli dependency matching global version used.
  - Presets can specify the cli version required.
- [#38] Warn if CLI is not compatible with version required by preset.

### 2.2.0

- Split out git repo steps from create command to plugin

### 2.1.0

- Output improvements for `create` command.

### 2.0.0

- Allow multiple `presets`, flag changed from `--preset` to `--presets`.

### 1.15.4

- Pin `inquirer` to `6.3.1`

### 1.15.3

- Only augment the creation context if these args are present

### 1.15.2

- allow presets to overide the create context

### 1.15.1

- Move `git init` to later to avoid checking in `node_modules` by default
upon `gasket create`

### 1.15.0

- Kicked off metrics lifecycle
   - Removed HTTP request from metrics collection

### 1.14.4

- Hotfix for uncaughtRejection

### 1.14.3

- Allow `record` negation
- Normalize the Git Repo data in metrics

### 1.14.2

- Track dependencies in an array for easy Elasticsearch indexing

### 1.14.1

- Fix what we're POST-ing to the metrics endpoint

### 1.14.0

- Fixes to finalize metrics tracking
   - ElasticSearch compatible date format
   - Lambda endpoint in the new AWS account

### 1.13.0

- Install using yarn during `create`
- Add specific integration test packages

### 1.12.0

- Allow local presets to be used during `create`

### 1.11.1

- Add gathered metrics

### 1.11.0

- local cmd invokes build + start hooks

### 1.10.0

- Allow `create` to occur in a directory that already exists

### 1.9.0

- Executing the `postCreate` lifecycle
- Fix integration tests for unknown prompts

### 1.8.0

- Generate the gasket.config.js with modifications by plugins.

### 1.7.0

- Allow plugins to prompt

### 1.6.0

- Optionally initialize `git` repo on `create`

### 1.5.1

- lock `@oclif/config@1.8.8`
  - [Tracking issue](https://github.com/oclif/config/issues/71) `@oclif/cli`
  - [Source](https://github.com/oclif/config/pull/70) `@oclif/cli` regression.

### 1.5.0

- Ship command metrics to an API

### 1.4.0

- Prefer local CLI.
- Added base metrics class that includes data collection.
- Use .includes instead of .equals because the ".git" is optional.
- Prompt for unit test suite from {mocha, jest, none}.
- Handle empty list of template globs.
- Pass npmrc via userconfig

### 1.3.3

- Upgrade to public issue warn-if-update plugin

### 1.3.2

- Remove `null, 2` from stringify as it created indention that did not please the linter.

### 1.3.1

- Introduce `jspretty` handlebars helper to create lint-able output.

### 1.3.0

- Issue warnings when update is available.

### 1.2.0

- Support adding additional plugins during `gasket create`
  with a new `--plugins` argument.

### 1.1.1

- Baseline test coverage for "gasket create" and `src/scaffold/*.js`

### 1.1.0

- Modular gasket create.

### 1.0.0

- Bump dependencies to 1.0.0.

### 0.5.2

- Conditionally spawn `npm.cmd` on Windows.

### 0.5.1

- Two small fixes for `gasket create` (#25)
  - Properly set state for plugins.
  - Use `process.hrtime()` to avoid download collisions.

### 0.5.0

- Phase one of two-phase `gasket create`.

### 0.4.0

- Updated for latest app-template & safer npm
  spawning. Output tips after `gasket create`.

### 0.3.3

- Do not swallow all `require` errors.

### 0.3.2

- Force environment to `local` for `local` command.

### 0.3.1

- Add `tar-fs` to `dependencies`.

### 0.3.0

- `gasket create APPNAME` MVP.


[#34]: https://github.com/godaddy/gasket/pull/34
[#38]: https://github.com/godaddy/gasket/pull/38
[#58]: https://github.com/godaddy/gasket/pull/58
[#64]: https://github.com/godaddy/gasket/pull/64
[#66]: https://github.com/godaddy/gasket/pull/66
