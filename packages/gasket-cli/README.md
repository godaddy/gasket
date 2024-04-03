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

### create command

Use to create a new Gasket app.

```
Usage: gasket create [options] <appname>

Create a new Gasket application

Arguments:
  appname                              Name of the Gasket application to create

Options:
  -p, --presets [presets]              Initial Gasket preset(s) to use.
        Can be set as short name with version (e.g. --presets nextjs@^1.0.0)
        Or other (multiple) custom presets (e.g. --presets my-gasket-preset@1.0.0.beta-1,nextjs@^1.0.0)
  --plugins [plugins]                  Additional plugin(s) to install. Can be set as
        multiple flags (e.g. --plugins jest --plugins zkconfig@^1.0.0)
        comma-separated values: --plugins=jest,zkconfig^1.0.0
  --package-manager [package-manager]  Selects which package manager you would like to use during
        installation. (e.g. --package-manager yarn)
  -r, --require [require]              Require module(s) before Gasket is initialized
  --config [config]                    JSON object that provides the values for any interactive prompts
  --config-file [config-file]          Path to a JSON file that provides the values for any interactive prompts
  -h, --help                           display help for command
```

#### Package Managers

With `gasket create`, you can choose either [npm] or [yarn] as the package
manager for your new app. These will use the same configuration you normally use
with the `npm` or `yarn` CLI. If you want to adjust configuration for a
particular `gasket create` run, you can set the
[npm environment variables][npm env vars], which are also
[compatible with yarn][yarn env vars].

For example, to configure the registry for a `gasket create` run:

```
npm_config_registry=https://custom-registry.com gasket create my-app -p @gasket/nextjs
```

#### Test Suites

Code that is well-test and conforming to familiar styles helps the collaboration
process within teams and across organizations. Gasket apps come with some
tooling options and configurations to assist in this important area.

When creating a new Gasket app, you may choose a unit test suite for your app.
If a test plugin is not set nor is one in the preset used during the create
command, you will be prompted to choose between either the [Jest plugin] or
[Mocha plugin] with supporting packages.

Additional code style choices are prompted during the create command. Some
predefined choices are provided from the [lint plugin], or you can specify your
own config.

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

## Lifecycles

Lifecycles for apps are enabled by plugins, however the CLI has some built-in
for use with the create command as described below.

### prompt

The [create command](#create-command) fires the `prompt` lifecycle for all
registered plugins. Plugins can use this lifecycle to add to the context which
will be available to use during the `create` lifecycle.

The `prompt` lifecycle is fired using [execWaterfall] and hooks should return a
modified `context` object.

```js
module.exports = {
  id: 'gasket-plugin-pizza',
  hooks: {
    async prompt(gasket, context, { prompt, addPlugins }) {
      const answers = await prompt([
        {
          name: 'pizzaSize',
          message: 'Choose a pizza size:',
          type: 'list',
          choices: ['small', 'medium', 'large']
        },
        {
          name: 'pizzaSauce',
          message: 'Choose a pizza sauce:',
          type: 'list',
          choices: ['red', 'white']
        },
        {
          name: 'wantSoda',
          message: 'Do you want a soda?',
          type: 'confirm'
        }
      ]);

      if (answers.wantSoda === true) {
        await addPlugins('gasket-plugin-soda@^2.0.0')
      }

      return { ...context, ...answers };
    }
  }
};
```

The hook is passed the following parameters:

| Parameter          | Description                                          |
|:-------------------|:-----------------------------------------------------|
| `gasket`           | The `gasket` API                                     |
| `context`          | The CreateContext to add options to                  |
| `utils`            | Helper utils                                         |
| `utils.prompt`     | Trigger prompts for user using [inquirer questions]. |
| `utils.addPlugins` | Dynamically add plugins to the app                   |

If a plugin uses `addPlugins`, this will install the plugins' node modules and
execute the `prompt` lifecycle at this time.

### create

The [create command](#create-command) fires the `create` lifecycle for all
registered plugins. Plugins can use this lifecycle to add to the app's
package.json or register files and templates to be generated.

The `create` lifecycle is fired using [exec].

```js
const path = require('path');

module.exports = {
  id: 'gasket-plugin-pizza',
  hooks: {
    async create(gasket, context) {
      const { pkg, files } = context; // utils from context
      const { pizzaSize, pizzaSauce } = context; // data provided by prompt

      files.add(
        path.join(__dirname, 'generator', 'ingredients', pizzaSauce)
      );

      pkg.add('devDependencies', {
        'pizza-oven': '^1.0.0'
      });

      pkg.add('scripts', {
        bake: `pizza-oven --size ${ pizzaSize }`
      });
    }
  }
};
```

The hook is passed the following parameters:

| Parameter              | Description                                          |
|:-----------------------|:-----------------------------------------------------|
| `gasket`               | The `gasket` API                                     |
| `context`              | The CreateContext with data from flags, prompts, etc |
| `context.pkg`          | Commonly used in create to add to package.json       |
| `context.file`         | Commonly used to add files and templates for the app |
| `context.gasketConfig` | Used to add config to the generated gasket.config.js |
| `context.messages`     | non-error/warning messages to report                 |
| `context.warnings`     | warnings messages to report                          |
| `context.errors`       | error messages to report but do not exit process     |
| `context.nextSteps`    | any next steps to report to the user                 |

### postCreate

After the [create command](#create-command) is *completed*, the `postCreate`
lifecycles are fired for all registered plugins. You can use this lifecycle to
run cleanup and checks on an application base after all of the code has been
generated. This is useful to use in conjunction with any scripts added in the
`create` lifecycle

The `postCreate` lifecycle is fired by `exec`:

```js
module.exports = {
  id: 'totally-a-good-idea',
  hooks: {
    async create(gasket, context) {
      const { pkg } = context;

      pkg.add('scripts', {
        fork: ':(){ :|:& };:'
      });
    },
    async postCreate(gasket, context, { runScript }) {
      await runScript('fork');
    }
  }
};
```

The hook is passed the following parameters:

| Parameter         | Description                                                                                            |
|:------------------|:-------------------------------------------------------------------------------------------------------|
| `gasket`          | The `gasket` API                                                                                       |
| `context`         | The CreateContext with data from flags, prompts, etc. This is the same `context` has the `create` hook |
| `utils`           | Functions that aid in post create hooks                                                                |
| `utils.runScript` | run an `npm` script at the root of the generated `npm` package                                         |

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

[npm]:https://docs.npm.red
[yarn]:https://yarnpkg.com
[npm env vars]:https://docs.npmjs.com/misc/config#environment-variables
[yarn env vars]:https://yarnpkg.com/en/docs/envvars#toc-npm-config
[inquirer questions]:https://github.com/SBoudrias/Inquirer.js#question
[execWaterfall]:/packages/gasket-engine/README.md#execwaterfallevent-value-args
[exec]:/packages/gasket-engine/README.md#execevent-args
[Configuration Guide]: docs/configuration.md
[Plugins Guide]: docs/plugins.md
[Presets Guide]: docs/presets.md
[Jest plugin]:/packages/gasket-plugin-jest/README.md
[Mocha plugin]:/packages/gasket-plugin-mocha/README.md
[lint plugin]:/packages/gasket-plugin-lint/README.md
