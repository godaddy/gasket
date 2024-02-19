# `@gasket/cli`

- Removed support for deprecated `--npmconfig` flag ([#647])
 
### 6.45.2

- Remove `eslint-plugin-mocha` from devDeps, add `cross-env`, update test script ([#670])

### 6.45.1

- @gasket/cli Jest refactor ([#667])

### 6.41.1

- Fix prompt handler type declaration ([#617])

### 6.41.0

- Add diagnostic logging for environment/config resolution when a `DEBUG=gasket:*` environment variable is set ([#607])

### 6.38.0

- Fix generation of files on Windows during gasket create when plugins use globs containing Windows separators ([#547])

### 6.34.6

- Retain destOverride from provided create context ([#480])

### 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade sinon to v14 ([#460])

### 6.34.3

- Upgrade mocha v10 ([#442])

### 6.34.2

- Upgrade fancy-test to v2 ([#437])
- fetch-mock upgrade v9 ([#439])

### 6.32.0

- Add `--config`, `--config-file`, and `--no-prompts` options for create command ([#410])

### 6.31.0

- Fix Windows path issues and EISDIR errors ([#406])

### 6.29.0

- Using `loadGasketConfigFile` and `flattenPresets` from [@gasket/resolve] ([#396])

### 6.27.1

- Add git plugin to CLI default plugins ([#392])
- Address createContext helper types ([#393])
- expose `GASKET_COMMAND` on process.env ([#393])

### 6.27.0

- Support for `GASKET_ENV` with fallback to `NODE_ENV` ([#387])
- expose Gasket settings on process.env

### 6.24.3

- Support for --require flag to load modules before Gasket initializes ([#370])

### 6.24.1

- Fix reads for root and src plugins dirs ([#371])

### 6.24.0

- Support for `/src/plugins` ([#363])

### 6.22.1

- Fix missing glob dependency

### 6.22.0

- Drop `vinyl-fs` and show final plugin source for files that were overridden ([#361])

### 6.21.0

- Add cypress as a test suite option ([#357])

### 6.20.0

- Determine env and apply config overrides before plugins are loaded ([#348])
  - Default to local env for local command

### 6.14.1

- Fix ti use `fs.createReadStream` for node < 16 support ([#329])

### 6.11.2

- Use fs.promises and upgrade mkdirp ([#319])

### 6.10.0

- TypeScript definitions for config & lifecycles ([#311])

### 6.0.0

- Version alignment
- Upgraded dependencies ([#247])

### 5.6.1

- Lookup version for plugins if not set ([#170])

### 5.3.4

- An ASCII version of the Gasket logo is now displayed in the CLI help ([#163])

### 5.3.2

- Cleanup unnecessary `./` in path joins ([#160])

### 5.3.1

- Allow context to set packageManager without overriding run commands ([#154])

### 5.3.0

- No longer require a preset for create command ([#152])

### 5.2.0

- Support force option with pkg.add ([#148])
  - Output semver warnings with print report

### 5.1.3

- Fix output of version blame if overridden ([#147])

### 5.1.0

- Move and expose PackageManager from `@gasket/utils` ([#143])

### 5.0.0

- Open Source Release
- Use cross-spawn for better windows support ([#122])
- CLI supports new short name resolution ([#100])

### 3.2.2

-  Fail on on missing modules imported to gasket.config ([#115])

### 3.2.1

- Stop blowing away named classes when merging config ([#113])

### 3.2.0

- One instance of pkgManager and made available on create context. ([#98])
  - pkgManager.info() allows package lookups with normalized JSON results for npm and yarn.

### 3.1.1

- Fix package.json scripts to wrap glob patterns in double-quotes

### 3.1.0

- Load config defined by presets ([#86])
- Deprecate `--npmconfig` and fix create using yarn ([#87])
  - Instead, use the `$NPM_CONFIG_USERCONFIG` env var.

### 3.0.0

- `gasket.command.id` available to create hooks ([#79])
- Fetch and load extended presets during create
- Move app-level commands to plugins ([#74])
- Move metrics to new plugin ([#74])
- Check dependencies during create with .has
- Support multiple --preset-path with --presets
- Always execute `configure` lifecycle for GasketCommands ([#71])
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

[@gasket/resolve]: /packages/gasket-resolve/README.md

[#34]: https://github.com/godaddy/gasket/pull/34
[#38]: https://github.com/godaddy/gasket/pull/38
[#58]: https://github.com/godaddy/gasket/pull/58
[#64]: https://github.com/godaddy/gasket/pull/64
[#66]: https://github.com/godaddy/gasket/pull/66
[#71]: https://github.com/godaddy/gasket/pull/71
[#74]: https://github.com/godaddy/gasket/pull/74
[#79]: https://github.com/godaddy/gasket/pull/79
[#86]: https://github.com/godaddy/gasket/pull/86
[#87]: https://github.com/godaddy/gasket/pull/87
[#98]: https://github.com/godaddy/gasket/pull/98
[#100]: https://github.com/godaddy/gasket/pull/100
[#113]: https://github.com/godaddy/gasket/pull/113
[#115]: https://github.com/godaddy/gasket/pull/115
[#122]: https://github.com/godaddy/gasket/pull/122
[#143]: https://github.com/godaddy/gasket/pull/143
[#147]: https://github.com/godaddy/gasket/pull/147
[#148]: https://github.com/godaddy/gasket/pull/148
[#152]: https://github.com/godaddy/gasket/pull/152
[#154]: https://github.com/godaddy/gasket/pull/154
[#160]: https://github.com/godaddy/gasket/pull/160
[#163]: https://github.com/godaddy/gasket/pull/163
[#170]: https://github.com/godaddy/gasket/pull/170
[#247]: https://github.com/godaddy/gasket/pull/247
[#311]: https://github.com/godaddy/gasket/pull/311
[#319]: https://github.com/godaddy/gasket/pull/319
[#329]: https://github.com/godaddy/gasket/pull/329
[#348]: https://github.com/godaddy/gasket/pull/348
[#357]: https://github.com/godaddy/gasket/pull/357
[#361]: https://github.com/godaddy/gasket/pull/361
[#363]: https://github.com/godaddy/gasket/pull/363
[#370]: https://github.com/godaddy/gasket/pull/370
[#371]: https://github.com/godaddy/gasket/pull/371
[#387]: https://github.com/godaddy/gasket/pull/387
[#392]: https://github.com/godaddy/gasket/pull/392
[#393]: https://github.com/godaddy/gasket/pull/393
[#396]: https://github.com/godaddy/gasket/pull/396
[#410]: https://github.com/godaddy/gasket/pull/410
[#436]: https://github.com/godaddy/gasket/pull/436
[#437]: https://github.com/godaddy/gasket/pull/437
[#439]: https://github.com/godaddy/gasket/pull/439
[#442]: https://github.com/godaddy/gasket/pull/442
[#460]: https://github.com/godaddy/gasket/pull/460
[#480]: https://github.com/godaddy/gasket/pull/480
[#547]: https://github.com/godaddy/gasket/pull/547
[#607]: https://github.com/godaddy/gasket/pull/607
[#617]: https://github.com/godaddy/gasket/pull/617
[#667]: https://github.com/godaddy/gasket/pull/667
