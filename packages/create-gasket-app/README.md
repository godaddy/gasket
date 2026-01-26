# create-gasket-app

Starter Pack for creating Gasket apps.

### Get Started Immediately

To create a new app, you may choose one of the following methods:

### npx

```sh
npx create-gasket-app@latest my-app
```

### npm

```sh
npm init gasket-app my-app
```

### Yarn

```sh
yarn create gasket-app my-app
```

#### options

Use to create a new Gasket app.

```
Usage: choose one of the following methods
- npx create-gasket-app@latest <appname> [options]
- npm init gasket-app <appname> [options]
- yarn create gasket-app <appname> [options]

Create a new Gasket application

Arguments:
  appname                              Name of the Gasket application to create

Options:
  --template [template]                Selects which template you would like to use during
        installation. (e.g. --template @gasket/template-nextjs-pages-js)
  --template-path [template-path]      (INTERNAL) Path to a local template package. Can be absolute
        or relative to the current working directory.
  --package-manager [package-manager]  Selects which package manager you would like to use during
        installation. (e.g. --package-manager yarn)
  -r, --require [require]              Require module(s) before Gasket is initialized
  --config [config]                    JSON object that provides the values for any interactive prompts
  --config-file [config-file]          Path to a JSON file that provides the values for any interactive prompts
  -h, --help                           display help for command
```

#### Templates

Templates provide a complete Gasket application ready to use.

##### Using Templates

```bash
# Use an official template from npm
npx create-gasket-app@latest my-app --template @gasket/template-nextjs-pages-js

# Use a versioned template
npx create-gasket-app@latest my-app --template @gasket/template-api@^2.0.0

# Use a local template (development)
npx create-gasket-app@latest my-app --template-path ./path/to/my-template

# Use a template with tag
npx create-gasket-app@latest my-app --template @gasket/template-nextjs-pages-js@beta
```

##### Template Structure

Templates are npm packages that follow this structure:

```
@gasket/template-example/
├── package.json
├── template/
│   ├── package.json      # App's package.json
│   ├── gasket.js         # App's gasket config
│   ├── src/              # App source files
│   └── ...               # Other app files
└── README.md
```

When using templates:
- The entire `template/` directory is copied to your new app
- Template dependencies are installed with `npm ci`

**Note:** Templates currently require npm as they come with `package-lock.json` files.

#### Package Managers

With `create-gasket-app`, you can choose either [npm] or [yarn] as the package
manager for your new app. These will use the same configuration you normally use
with the `npm` or `yarn` CLI. If you want to adjust configuration for a
particular `create-gasket-app` run, you can set the
[npm environment variables][npm env vars], which are also
[compatible with yarn][yarn env vars].

For example, to configure the registry for a `gasket create` run:

```
npm_config_registry=https://custom-registry.com npx create-gasket-app@latest -p @gasket/nextjs
```

#### Test Suites

Code that is well-tested and conforms to familiar styles helps the collaboration
process within teams and across organizations. Gasket apps come with some
tooling options and configurations to assist in this important area.

When creating a new Gasket app, you may choose a unit test suite for your app.
If a test plugin is not set, you will be prompted to choose between either the
[Jest plugin] or [Mocha plugin] with supporting packages.

Additional code style choices are prompted during the create command. Some
predefined choices are provided from the [lint plugin], or you can specify your
own config.

## Lifecycles

Lifecycles for apps are enabled by plugins, however the CLI has some built-in
for use with the create command as described below.

### prompt

`create-gasket-app` fires the `prompt` lifecycle for all
registered plugins. Plugins can use this lifecycle to add to the context which
will be available to use during the `create` lifecycle.

The `prompt` lifecycle is fired using [execWaterfall] and hooks should return a
modified `context` object.

```js
//  gasket-plugin-pizza.js

const name = 'gasket-plugin-pizza';
const hooks = {
  async prompt(gasket, context, { prompt }) {
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

    return { ...context, ...answers };
  }
};

export default { name, hooks };
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

`create-gasket-app` fires the `create` lifecycle for all
registered plugins. Plugins can use this lifecycle to add to the app's
package.json or register files and templates to be generated.

The `create` lifecycle is fired using [exec].

```js
//  gasket-plugin-pizza.js

import path from 'path';

const name = 'gasket-plugin-pizza';
const hooks = {
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
};

export default { name, hooks };
```

The hook is passed the following parameters:

| Parameter              | Description                                          |
|:-----------------------|:-----------------------------------------------------|
| `gasket`               | The `gasket` API                                     |
| `context`              | The CreateContext with data from flags, prompts, etc |
| `context.pkg`          | Commonly used in create to add to package.json       |
| `context.files`        | Commonly used to add files and templates for the app |
| `context.gasketConfig` | Used to add config to the generated gasket.js |
| `context.messages`     | non-error/warning messages to report                 |
| `context.warnings`     | warnings messages to report                          |
| `context.errors`       | error messages to report but do not exit process     |
| `context.nextSteps`    | any next steps to report to the user                 |

### postCreate

After `create-gasket-app` is *completed*, the `postCreate`
lifecycles are fired for all registered plugins. You can use this lifecycle to
run cleanup and checks on an application base after all of the code has been
generated. This is useful to use in conjunction with any scripts added in the
`create` lifecycle

The `postCreate` lifecycle is fired by [exec]:

```js
// totally-a-good-idea.js

const name = 'totally-a-good-idea';
const hooks = {
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

export default { name, hooks };
```

The hook is passed the following parameters:

| Parameter         | Description                                                                                            |
|:------------------|:-------------------------------------------------------------------------------------------------------|
| `gasket`          | The `gasket` API                                                                                       |
| `context`         | The CreateContext with data from flags, prompts, etc. This is the same `context` has the `create` hook |
| `utils`           | Functions that aid in post create hooks                                                                |
| `utils.runScript` | run an `npm` script at the root of the generated `npm` package                                         |

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[npm]:https://docs.npm.red
[yarn]:https://yarnpkg.com
[npm env vars]:https://docs.npmjs.com/misc/config#environment-variables
[yarn env vars]:https://yarnpkg.com/en/docs/envvars#toc-npm-config
[Jest plugin]:/packages/gasket-plugin-jest/README.md
[Mocha plugin]:/packages/gasket-plugin-mocha/README.md
[execWaterfall]:/packages/gasket-core/docs/gasket-engine.md#execwaterfallevent-value-args
[exec]:/packages/gasket-core/docs/gasket-engine.md#execevent-args
[inquirer questions]:https://github.com/SBoudrias/Inquirer.js#question
[lint plugin]:/packages/gasket-plugin-lint/README.md
