## @gasket/cli

CLI for rapid web development with gasket

<!-- toc -->
* [Commands](#commands)
* [Lifecycle Events](#lifecycle-events)
* [Tests](#tests)
* [install extra dependencies](#install-extra-dependencies)
* [run `gasket local`, for example](#run-gasket-local-for-example)
* [Metrics](#metrics)
<!-- tocstop -->

## Usage
<!-- usage -->
```sh-session
$ npm install -g @gasket/cli
$ gasket COMMAND
running command...
$ gasket (-v|--version|version)
@gasket/cli/2.6.2-canary.0 darwin-x64 node-v10.15.3
$ gasket --help [COMMAND]
USAGE
  $ gasket COMMAND
...
```
<!-- usagestop -->

# Commands
<!-- commands -->
* [`gasket analyze`](#gasket-analyze)
* [`gasket build`](#gasket-build)
* [`gasket create APPNAME`](#gasket-create-appname)
* [`gasket help [COMMAND]`](#gasket-help-command)
* [`gasket local`](#gasket-local)
* [`gasket start`](#gasket-start)

## `gasket analyze`

Analyze application code bundles

```
USAGE
  $ gasket analyze

OPTIONS
  -c, --config=config    [default: gasket.config] Fully qualified gasket config to load
  -r, --root=root        [default: /path/to/your/app] Top-level app directory
  --env=env              Target runtime environment
  --npmconfig=npmconfig  [default: ~/.npmrc] .npmrc to be used for npm actions in @gasket/cli
  --[no-]record          Whether or not to emit this command as part of Gasket's metrics lifecycle
```

_See code: [src/commands/analyze.js](https://github.com/godaddy/gasket/blob/v2.6.2-canary.0/src/commands/analyze.js)_

## `gasket build`

Prepare your application code for deployment

```
USAGE
  $ gasket build

OPTIONS
  -c, --config=config    [default: gasket.config] Fully qualified gasket config to load
  -r, --root=root        [default: /path/to/your/app] Top-level app directory
  --analyze              Top-level app directory
  --env=env              Target runtime environment
  --npmconfig=npmconfig  [default: ~/.npmrc] .npmrc to be used for npm actions in @gasket/cli
  --[no-]record          Whether or not to emit this command as part of Gasket's metrics lifecycle
```

_See code: [src/commands/build.js](https://github.com/godaddy/gasket/blob/v2.6.2-canary.0/src/commands/build.js)_

## `gasket create APPNAME`

Create a new gasket application

```
USAGE
  $ gasket create APPNAME

ARGUMENTS
  APPNAME  Name of the gasket application to create

OPTIONS
  -p, --presets=presets              [default: default] Initial gasket preset(s) to use (Defaults to
                                     @gasket/default-preset).
                                     Can be set as short name with version (e.g. --presets default@^1.0.0)
                                     Or other (multiple) custom presets (e.g. --presets
                                     my-gasket-preset@1.0.0.beta-1,default@^1.0.0)

  --npmconfig=npmconfig              [default: ~/.npmrc] .npmrc to be used for npm actions in @gasket/cli

  --package-manager=package-manager  Selects which package manager you would like to use during
                                     installation. (e.g. --package-manager yarn)

  --plugins=plugins                  Additional plugin(s) to install. Can be set as
                                     multiple flags (e.g. --plugins jest --plugins zkconfig@^1.0.0)
                                     comma-separated values: --plugins=jest,zkconfig^1.0.0
```

_See code: [src/commands/create.js](https://github.com/godaddy/gasket/blob/v2.6.2-canary.0/src/commands/create.js)_

## `gasket help [COMMAND]`

display help for gasket

```
USAGE
  $ gasket help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src/commands/help.ts)_

## `gasket local`

Start your application server in local development mode

```
USAGE
  $ gasket local

OPTIONS
  -c, --config=config    [default: gasket.config] Fully qualified gasket config to load
  -r, --root=root        [default: /path/to/your/app] Top-level app directory
  --env=env              Target runtime environment
  --npmconfig=npmconfig  [default: ~/.npmrc] .npmrc to be used for npm actions in @gasket/cli
  --[no-]record          Whether or not to emit this command as part of Gasket's metrics lifecycle
```

_See code: [src/commands/local.js](https://github.com/godaddy/gasket/blob/v2.6.2-canary.0/src/commands/local.js)_

## `gasket start`

Start your application server

```
USAGE
  $ gasket start

OPTIONS
  -c, --config=config    [default: gasket.config] Fully qualified gasket config to load
  -r, --root=root        [default: /path/to/your/app] Top-level app directory
  --env=env              Target runtime environment
  --npmconfig=npmconfig  [default: ~/.npmrc] .npmrc to be used for npm actions in @gasket/cli
  --[no-]record          Whether or not to emit this command as part of Gasket's metrics lifecycle
```

_See code: [src/commands/start.js](https://github.com/godaddy/gasket/blob/v2.6.2-canary.0/src/commands/start.js)_
<!-- commandsstop -->


# Lifecycle Events

### prompt

The [create command](#gasket-create-appname) fires the `prompt` lifecycle for
all registered plugins. Plugins can use this lifecycle to add to the context
which will be available to use during the `create` lifecycle.

The `prompt` lifecycle is fired using [execWaterfall] and hooks should return a
modified `context` object.

```js
module.exports = {
  id: 'pizza-plugin',
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
        await addPlugins('soda-plugin@^2.0.0')
      }

      return { ...context, ...answers };
    }
  }
};
```

The hook is passed the following parameters:

| Parameter             | Description |
|-----------------------|-------------|
| `gasket`              | The `gasket` API |
| `context`             | The CreateContext to add options to |
| `utils`               | Helper utils |
| `utils.prompt`        | Trigger prompts for user using [inquirer questions]. |
| `utils.addPlugins`    | Dynamically add plugins to the app |

If a plugin uses `addPlugins`, this will install the plugins' node modules and
execute the `prompt` lifecycle at this time.

### create

The [create command](#gasket-create-appname) fires the `create` lifecycle for
all registered plugins. Plugins can use this lifecycle to add to the app's
package.json or register files and templates to be generated.

The `create` lifecycle is fired using [exec].

```js
const path = require('path');

module.exports = {
  id: 'pizza-plugin',
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
        bake: `pizza-oven --size ${pizzaSize}`
      });
    }
  }
};
```

The hook is passed the following parameters:

| Parameter               | Description |
|-------------------------|-------------|
| `gasket`                | The `gasket` API |
| `context`               | The CreateContext with data from flags, prompts, etc |
| `context.pkg`           | Commonly used in create to add to package.json |
| `context.file`          | Commonly used to add files and templates for the app |
| `context.gasketConfig`  | Used to add config to the generated gasket.config.js |
| `context.messages`      | non-error/warning messages to report |
| `context.warnings`      | warnings messages to report |
| `context.errors`        | error messages to report but do not exit process |
| `context.nextSteps`     | any next steps to report to the user |

### postCreate

After the [create command](#gasket-create-appname) is *completed*, the
`postCreate` lifecycles are fired for all registered plugins. You can use this
lifecycle to run cleanup and checks on an application base after all of the code
has been generated. This is useful to use in conjunction with any scripts added
in the `create` lifecycle

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

| Parameter               | Description |
|-------------------------|-------------|
| `gasket`                | The `gasket` API |
| `context`               | The CreateContext with data from flags, prompts, etc. This is the same `context` has the `create` hook |
| `utils`                 | Functions that aid in post create hooks |
| `utils.runScript`       | run an `npm` script at the root of the generated `npm` package |


# Tests

Tests are written with `mocha`, `@oclif/test`, and `assume`. They can be run &
debugged with `npm`:

``` bash
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
dependencies that `gasket` apps come with so that the CLI can work properly.
Be sure to `npm install --no-save` so you don't mutate the built in the
`package.json` for this CLI

```bash
# install extra dependencies
npm install --no-save @gasket/default-preset @gasket/redux next react-dom

# run `gasket local`, for example
./bin/run local --config /path/to/gasket.config.js
```

# Metrics

> **NOTE:** Metrics are **not** collected by `gasket`. The `metrics` lifecycle
 exists so that _you_ can track metrics and usage of `gasket` within your own 
 organization.

The usage of `gasket` commands can be tracked by a plugin using the `metrics` 
lifecycle hook. It is important to note that this _does not_ block the 
execution of the command. The `metrics` lifecycle can be used to gather 
the following information:

```json
{
  "name": "name in package.json",
  "version": "version in package.json",
  "gasket": {
    "@gasket/literally-any-repo": "that is installed"
  },
  "repository": "git repository",
  "branch": "git branch",
  "config": {
    "additional keys": "used in gasket.config.js"
  },
  "system": {
    "platform": "os.platform()",
    "release": "os.release()",
    "arch": "os.arch()"
  },
  "env": "NODE_ENV",
  "argv": "Literally the args that you passed to gasket",
  "time": "Date.now()",
  "cmd": "The gasket command that was run"
}
```

[inquirer questions]: https://github.com/SBoudrias/Inquirer.js#question
[execWaterfall]:https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-engine#execwaterfallevent-value-args
[exec]:https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-engine#execevent-args
