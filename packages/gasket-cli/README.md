# @gasket/cli

CLI for rapid application development

## Guides

* [Configuration Guide]
* [Plugins Guide]
* [Presets Guide]

## Installation

```
npm i -global @gasket/cli
```

## Configuration

The `configure` lifecycle executes for each Gasket command.

Configuration for a Gasket session goes through a series of steps:

1. Config file loaded by CLI
   - Environment is set
   - Overrides are applied
   - Default plugins are added
2. -_`init` lifecycle is executed_
3. Plugins adjust config by hooking `configure` lifecycle

When the CLI starts up, it attempts to load the `gasket.config` in its default
expected location, or as specified with [command options]. Plugins then have the
opportunity in the `configure` lifecycle.

See the [Configuration Guide] for additional details.

## Commands

With the Gasket CLI, you can run commands to create new apps, or commands that
perform actions with an app. In a terminal, you can run `gasket` to see what
commands are available, and `gasket help` to get more details on command.

### help command

Display help for Gasket CLI and commands, also available with the `--help` option.

```
Usage: gasket [options] [command]

CLI for rapid application development with gasket

Options:
  --gasket-config [gasket-config-path]  Fully qualified Gasket config to load (default: "gasket.config")
  -V, --version                         output the version number
  -h, --help                            display help for command

Commands:
  create [options] <appname>            Create a new Gasket application
  help [command]                        display help for command
```

### Command specific help

Display expanded help output for a specific command.

```
gasket <cmd> --help
```

### --require module

Using this flag allows preloading modules when the CLI starts up. The `module`
may be either a path to a file, or a node module name. Only CommonJS modules are
supported. This can be useful for loading instrumentation modules.

```bash
gasket start --require ./setup.js --require elastic-apm-node/start
```

# Tests

Tests are written with `jest`. They can be run &
debugged with `npm`:

```bash
### Run all tests
npm test

### Run all unit or integration tests
npm run test:unit
npm run test:integration

### Run a single test file
npx mocha --require test/setup.js test/command.test.js

### Debug gasket within tests
DEBUG='gasket*' npm test

### Debug npm and gasket across two child process layers
DEBUG=gasket* GASKET_DEBUG_NPM=yes GASKET_DEBUG_TESTS=yes npx mocha --require test/setup.js test/integration/commands/create.test.js
```

If you want to use a local copy of the CLI has a drop-in replacement for the one
bundled in `gasket` applications you can use `--config` flag to manually specify
where the configuration is. **NB** you will need to install some additional
dependencies that Gasket apps come with so that the CLI can work properly. Be
sure to `npm install --no-save` so you don't mutate the built in the
`package.json` for this CLI:

```bash
# install extra dependencies
npm install --no-save @gasket/preset-nextjs @gasket/redux next react-dom

# run `gasket local`, for example
./bin/run local --config /path/to/gasket.config.js
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[Configuration Guide]: docs/configuration.md
[Plugins Guide]: docs/plugins.md
[Presets Guide]: docs/presets.md
