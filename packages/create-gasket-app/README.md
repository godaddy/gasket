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

When creating a new Gasket app, you can configure your own test suite and
linting setup according to your team's preferences.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[npm]:https://docs.npm.red
[yarn]:https://yarnpkg.com
[npm env vars]:https://docs.npmjs.com/misc/config#environment-variables
[yarn env vars]:https://yarnpkg.com/en/docs/envvars#toc-npm-config
