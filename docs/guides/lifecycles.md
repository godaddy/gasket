# lifecycles

- `@gasket/cli`
  - [`init`](#init)
  - [`build`](#build)
  - [`start`](#start)
  - [`configure`](#configure)
  - [`preboot`](#preboot)
  - [`create`](#create)
  - [`postCreate`](#postcreate)
  - [`initOclif`](#initoclif)
  - [`getCommands`](#getcommands)
- `@gasket/plugin-config`
  - [`appRequestConfig`](#apprequestconfig)
  - [`appEnvConfig`](#appenvconfig)
- `@gasket/plugin-redux`
  - [`initReduxState`](#initreduxstate)
  - [`initReduxStore`](#initreduxstore)
- `@gasket/plugin-log`
  - [`logTransports`](#logtransports)
- `@gasket/plugin-service-worker`
  - [`composeServiceWorker`](#composeserviceworker)
  - [`serviceWorkerCacheKey`](#serviceworkercachekey)
- `@gasket/plugin-workbox`
  - [`workbox`](#workbox)
- `@gasket/plugin-nextjs`
  - [`next`](#next)
  - [`nextConfig`](#nextconfig)
  - `@gasket/plugin-webpack` lifecycles included
- `@gasket/plugin-webpack`
  - [`webpack`](#webpack)
  - [`webpackChain`](#webpackchain)
- `@gasket/plugin-express`
  - [`express`](#express)
  - [`middleware`](#middleware)
- `@gasket/plugin-metadata`
  - [`metadata`](#metadata)

For reference in JSDOC the `Gasket` type can be defined as follows:

```js
/**
 * @typedef Gasket
 * @prop {Object} config - configuration defined by gasket.config.js
 * @prop {Object} logger - a winston logger
 * @prop {Function} resolver - A resolver defined by @gasket/resolve
 * @prop {Function} exec - defined by @gasket/engine
 * @prop {Function} execWaterfall - defined by @gasket/engine
 * @prop {Function} execMap - defined by @gasket/engine
 * @prop {Function} execApply - defined by @gasket/engine
 * @prop {Function} execSync - defined by @gasket/engine
 * @prop {Function} execWaterfallSync - defined by @gasket/engine
 * @prop {Function} execMapSync - defined by @gasket/engine
 * @prop {Function} execApplySync - defined by @gasket/engine
 */
```

**Notes**:
- [`@gasket/resolve`] has full documentation for its usage
- [`@gasket/engine`] has documentation for all of the `exec*` methods
- The `winston` logger is fully documented [here](https://github.com/winstonjs/winston)
- `gasket` also contains `_hooks`, `_plans`, and `_plugins`. These are for
internal use.

### init

- **Executed during:** Any gasket CLI command.
- [**Flow chart**](../images/lifecycle/events/init.svg)

Signals the start of any gasket command and allows running of code immediately
before any `gasket` command. If it errors, the command will exit early.

```js
/**
 * @param {Gasket} gasket The gasket API.
 * @returns {Promise} completion handler.
 */
async function initHook(gasket) {
  gasket.logger.debug('Started gasket command.');
}
```

### build

- **Executed during:** `gasket build` CLI.
- [**Flow chart**](../images/lifecycle/events/build.svg)

Instructs that the gasket application needs to be built for deployment. Runs
code immediately before `gasket build` command. If it errors, the gasket will
not build.

```js
/**
 * @param {Gasket} gasket The gasket API.
 * @returns {Promise} completion handler.
 */
async function buildHook(gasket) {
  gasket.logger.debug('Started a gasket build.')
}
```

### start

- **Executed during:** `gasket start` CLI.
- [**Flow chart**](../images/lifecycle/events/start.svg)

Instructs that the Gasket application needs to be started for production
deployment. If it errors, the gasket will not start.

```js
/**
 * @param {Gasket} gasket The gasket API.
 * @returns {Promise} completion handler.
 */
async function startHook(gasket) {
  if(gasket.config.meaningOfLife !== 42) {
    throw new Error('existential crisis'); // prevents app startup
  }
}
```

### configure

- **Executed during:** `start` lifecycle
- [**Flow chart**](../images/lifecycle/events/configure.svg)

Used by plugins to inject defaults into the loaded `gasket.config` so developers
do no have to specify all configuration options for the plugin.

```js
/**
 * @param {Gasket} gasket The gasket API.
 * @param {Object} baseConfig gasket config
 * @returns {Promise<Object>} Resolves to newly augmented configuration
 */
async function configureHook(gasket, baseConfig={}) {
  return {
    meaningOfLife: 42,
    ...baseConfig
  };
}
```

### preboot

- **Executed during:** `start`, `local` lifecycle
- [**Flow chart**](../images/lifecycle/events/preboot.svg)

Ran before the `configure` event is executed allows to execute code before an
application start. Occurs prior to the `local` and `start` hooks. If it errors,
the gasket will not start.

```js
/**
 * @param {Gasket} gasket The gasket API.
 * @returns {Promise} completion handler.
 */
async function prebootHook(gasket) {
  gasket.logger.debug('About to run a gasket command! Wish me luck!');
}
```

### create

- **Executed during:** `gasket create` CLI
- [**Flow chart**](../images/lifecycle/events/create.svg)

Allows your plugins to introduce content that needs to be created during the
initial scaffolding of a new project during `gasket create`. The full documentation
for `CreateContext` is defined [here](/packages/gasket-cli/src/scaffold/create-context.js#L6-L50).

```js
/**
 * @param  {Gasket} gasket The gasket API
 * @param  {CreateContext} context
 * @param  {Function} context.files.add files to add to a generated gasket application.
 * These paths are relative to source of your plugin.
 * @param  {Function} context.pkg.add Performs an intelligent, domain-aware merge of the
 * `value` for the given `key` into the package.json fields associated with this instance.
 * @returns {Promise} completion handler
 */
async function(gasket, context) {
  const { files, pkg } = context;
  files.add(
    `${__dirname}/file/to/add.js`,
    `${__dirname}/file/to/add.test.js`
  );

  pkg.add('license', 'WTFPL');

  pkg.add('devDependencies', {
    'volkswagen': '^1.0.0',
    'is-odd': '^3.0.0',
    'is-even': '^1.0.0'
  });
}
```

### postCreate

- **Executed after:** `gasket create` CLI

After the `create` command is *completed*, the
`postCreate` lifecycles are fired for all registered plugins. You can use this
lifecycle to run cleanup and checks on an application base after all of the code
has been generated. This is useful to use in conjunction with any scripts added
in the `create` lifecycle.

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

### initOclif

- **Executed during:** `gasket` CLI
- [**Flow chart**](../images/lifecycle/events/initOclif.svg)

Allows you to interact with the `oclif` framework where the `gasket` CLI
application is build upon.

```js
/**
 * @param  {Gasket} gasket The gasket API
 * @param  {Object} oclifConfig oclif configuration
 * @param  {Object} BaseCommand The base Gasket command, which your commands may extend
 * @returns {Promise} completion handler
 */
async initOclifHook(gasket, { oclifConfig, BaseCommand }) {
  gasket.logger.debug('intialized oclif');
}
```

### getCommands

- **Executed during:** `gasket` CLI

Allows you to add `oclif` based commands for the `gasket` CLI.

```js
/**
 * @param  {Gasket} gasket The gasket API
 * @param  {Object} oclifConfig oclif configuration
 * @param  {Object} BaseCommand The base Gasket command, which your commands may extend
 * @returns {Promise<Command[]>} array of commands
 */
async getCommands(gasket, { oclifConfig, BaseCommand }) {
  const { logger } = gasket;

  class CustomCommand extends BaseCommand {
    async runHooks() {
      logger.debug('executing custom command');
      await this.gasket.exec('custom');
    }
  }
  CustomCommand.id = 'custom';

  return [
    CustomCommand
  ]
}
```
---

### appRequestConfig

- **Executed during:** Every incoming HTTP request
- **Documentation:** [here](/packages/gasket-plugin-config)

Allows plugins to inject configuration derived from the request being
processed.

```js
/**
 * @param {Gasket} gasket The gasket API
 * @param {Object} baseConfig base gasket configuration
 * @param {Request} req Incoming HTTP request.
 * @param {Response} res Outgoing HTTP request.
 * @returns {Promise<Object>} modified configuration
 */
async appRequestConfigHook(gasket, baseConfig, req, res) {
  const featureFlags = await getFeatureFlagsInSomeExternalFile({
    userId: req.userId,
    locale: req.cookies.market
  });

  return {
    ...baseConfig,
    featureFlags
  };
}
```

### appEnvConfig

- **Executed during:** `preboot` lifecycle.
- **Documentation:** [here](/packages/gasket-plugin-config)

Allows you to modify the current configuration and return a new object with
injected configuration changes.

```js
/**
 * @param {Gasket} gasket The gasket API
 * @param {Object} baseConfig base gasket configuration
 * @returns {Promise<Object>} modified configuration
 */
async appEnvConfigHook(gasket, baseConfig) {
  const remoteCfg = await fetchRemoteConfig();

  return {
    ...baseConfig,
    ...remoteCfg
  };
}
```

---

### initReduxStore

- **Executed during:** Every incoming HTTP request
- **Documentation:** [https://github.com/godaddy/gasket/tree/master/packages/gasket-redux-plugin#initreduxstore](/packages/gasket-redux-plugin#initreduxstore)

Read the initial state or fire off actions to populate the store once it's
created server-side.

```js
const methods = require('./where/redux/actions/are');

/**
 * @param {Gasket} gasket The gasket API
 * @param {Store} store redux store
 * @param {Request} req Incoming HTTP request.
 * @param {Response} res Outgoing HTTP request.
 * @returns {Promise} completion handler
 */
async initReduxStoreHook(gasket, store, req, res) {
  const { method } = req.params;
  store.dispatch(methods[method]());
}
```

### initReduxState

- **Executed during:** Every incoming HTTP request
- **Documentation:** [https://github.com/godaddy/gasket/tree/master/packages/gasket-redux-plugin#initreduxstate](/packages/gasket-redux-plugin#initreduxstate)
- [**Flow chart**](../images/lifecycle/events/initReduxState.svg)

Allows you to modify the initial state of the redux store. This state is later
used by the `initReduxStore` lifecycle to create the actual redux store.

```js
/**
* @param {Gasket} gasket The gasket API
* @param {Object} state redux state
* @param {Request} req Incoming HTTP request.
* @param {Response} res Outgoing HTTP request.
* @returns {Promise<Object>} initial redux state, given the http requests.
 */
async initReduxStateHook(gasket, state, req, res) {
  return {
    ip: req.ip,
    ...state
  };
}
```

---

### webpackChain

- **Executed during:** `start`, `build` lifecycles
- **Documentation:** [here](/packages/gasket-webpack-plugin#webpackchain)

Create the initial webpack configuration using the `webpack-chain` chaining
syntax. The resulting configuration will be passed to the `webpack` hook.

```js
const { DefinePlugin } = require('webpack');

/**
 * @param {Gasket} gasket The gasket API
 * @param {Object} chain webpack chain
 * @param {Object} data next.js metadata
 */
function webpackChainHook(gasket, chain, data) {
  chain
    .plugin('define')
    .use(DefinePlugin, {
      MEANING_OF_LIFE: 42
    });
}
```

### webpack

- **Executed during:** `start`, `build` lifecycles
- **Documentation:** [here](/packages/gasket-webpack-plugin#webpack)
- [**Flow chart**](../images/lifecycle/events/webpack.svg)

The `webpack` hook allows you to modify the WebPack configuration that is
used by the `next.js` framework to build your application.

```js
const { DefinePlugin } = require('webpack');

/**
 * @param {Gasket} gasket The gasket API
 * @param {Object} config webpack configuration
 * @param {Object} data next.js metadata
 * @return {Object} resolved webpack configuration
 */
function webpackHook(gasket, config, data) {
  config.plugins.push(
    new DefinePlugin({
      MEANING_OF_LIFE: 42
    })
  );

  return config;
}
```

### next

- **Executed during:** `start` lifecycle
- **Documentation:** [here](/packages/gasket-nextjs-plugin#next)

When the `next` server is created this hook will execute. This allows you to
interact with the `next` application instance. An instance of either
`next-server` or `next-dev-server` will be available.

```js
/**
 * @param {Gasket} gasket The gasket API
 * @param {Object} app gasket's express application
 * @return {Promise} completion handler
 */
async function nextHook(gasket, app) {
  gasket.log.info('Render opts: %O', app.renderOpts);
}
```

### nextConfig

- **Executed during:** `start`, `build` lifecycles
- **Documentation:** [here](/packages/gasket-nextjs-plugin#nextconfig)

The `nextConfig` hook allows you to modify the `next` config before the `next`
server is created.

```js
const withOffline = require('next-offline');

/**
 * @param {Gasket} gasket The gasket API
 * @param {Object} config Next config
 * @returns {Object} Next config updated
 */
function nextConfig(gasket, config) {
  const result = withOffline({
    ...config,
    dontAutoRegisterSw: true
  });
  return result;
}
```

### middleware

- **Executed during:** `start` lifecycle
- **Documentation:** [here](/packages/gasket-express-plugin#middleware)
- [**Flow chart**](../images/lifecycle/events/middleware.svg)

After the `express` instance has been created it will execute the `middleware`
hook. Any function you return in this lifecycle will be mounted as middleware
layer.

```js
const cookieParser = require('cookie-parser');

/**
 * Add some middleware to use on every route
 * @param {Gasket} gasket The gasket API
 * @param {Object} app gasket's express application
 * @return {Middleware[]} Express middlewares to apply
 */
async function middlewareHook(gasket, app) {
  const { logger } = gasket;
  return [
    cookieParser(),
    (req, res, next) => {
      logger.debug(`received request from ${req.ip}`);
      next();
    },
    (req, res, next) => {
      logger.debug(`attached cookies: ${JSON.stringify(req.cookies, null, 2)}`)
      next();
    }
  ]
}
```
### metadata

- **Executed during:** : `init` lifecycle
- **Documentation**: [here](/packages/gasket-metadata-plugin#gasketplugin-metadata)

Adds additional metadata to gasket.config.metadata

```js
/**
 * Logs some of the metadata present in gasket.config and then
 * adds a little extra to be appended to the metadata of this plugin
 *
 * @param {Gasket} gasket The Gasket API
 * @param {Object} data default metadata provided to the hook
 */
async function metadataHook(gasket, data) {
  // a list of hooks that this plugin implements
  console.log(data.hooks);

  // flattened data from package.json of this plugin
  console.log(data.name);
  console.log(data.version);
  console.log(data.author);

  // adding extra data to this plugin's metadata
  return {
    ...data,
    extra: 'information'
  }
}
```

### express

- **Executed during:** `start` lifecycle
- **Documentation:** [here](/packages/gasket-express-plugin#express)
- [**Flow chart**](../images/lifecycle/events/express.svg)

Executed after the `middleware` lifecycle, this will give you full access to
the `express` instance. You can assign routes, enable or disable settings,
anything you would normally do with `express`.

```js
/**
 * Adds a route
 * @param {Gasket} gasket The gasket API
 * @param {Object} app gasket's express application
 */
async function expressHook(gasket, app) {
  app.get('/humans.txt', (req, res) => {
    res.send('what up my dude');
  });
}
```
### errorMiddleware

- **Executed during:** `start` lifecycle
- **Documentation:** [here](/packages/gasket-express-plugin#errormiddleware)

Allows you to assign middleware layers that can handle potential errors. These
are added after all our internal routing and `next.js` handoff's are setup.

```js
const cookieParser = require('cookie-parser');

/**
 * Add some middleware to use on every route
 * @param {Gasket} gasket The gasket API
 * @param {Object} app gasket's express application
 * @return {Middleware[]} Express middlewares to apply
 */
async function errorMiddlewareHook(gasket, app) {
  return [
    (req, res, next) => {
      app.set('calls', app.get('calls') + 1);
      next();
    },
    (req, res, next) => {
      const calls = app.get('calls');
      gasket.logger.debug(`This app has received ${calls} calls`);
      next();
    }
  ]
}
```

---

### logTransports

- **Executed during:** `init` lifecycle
- **Documentation:** [https://github.com/godaddy/gasket/tree/master/packages/gasket-log-plugin#logtransports](/packages/gasket-log-plugin#logtransports)

Allows you to define custom `winston` middlewares based on the fully
loaded configuration for your `gasket` application (including environments).


```js
const fluent = require('fluent-logger');
const FluentTransport = fluent.support.winstonTransport();
  
/**
 * Define additional log transports for your application
 * @param {Gasket} gasket The gasket API
 * @return {Transport[]} winston Transports to consume
 */
module.exports = async function logTransportsHook(gasket) {
  const { config } = gasket;

  return new FluentTransport('mytag', config.fluentd);
};
```

---

### composeServiceWorker

- **Executed during:** Incoming requests for the service worker script
- **Documentation**: [here](/packages/gasket-service-worker-plugin#composeserviceworker)

Allows plugins to add to the service worker script, by concatenating inline
script text or loaded file data.

```js
/**
 * @param {Gasket} gasket The gasket API
 * @param {String} content js string to add to the service worker
 * @param {Request} req incoming HTTP request
 */
function composeServiceWorkerHook (gasket, content, req) {
      // `req` allows SW content based on hostname, cookie, etc.
      return content.concat(`
self.addEventListener('push', (event) => {
  const title = 'My App Notification';
  const options = {
    body: event.data.text()
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
`);
    }
```

### serviceWorkerCacheKey

- **Executed during:** `configure` lifecycle.
- **Documentation**: [here](/packages/gasket-service-worker-plugin#serviceworkercachekey)

Allows plugins to effect the cache key based on the request.

Composing service workers can potentially be process intensive, and it is
unnecessary to recompose the service worker for each unique request. This hook
gathers functions which accept Request as an argument and return a string value.

```js
/**
 * @param {Gasket} gasket The gasket API
 */
function serviceWorkerCacheKeyHook (gasket) {
  /**
   * @param {Request} req Incoming HTTP request.
   * @return {String} cache key
   */
  return function (req) {
    return req.cookies.market || 'en-US';
  };
}
```

---

### workbox

- **Executed during:** `composeServiceWorker` lifecycle
- **Documentation:**: [here](/packages/gasket-workbox-plugin#workbox)

This hook allows other gasket plugins to add to the Workbox config in order to
precache files, set runtime cache rules, etc. Hooks should return an object
partial which will be deeply merged.

```js
/**
 * Returns a config partial which will be merged
 * @param {Gasket} gasket The gasket API
 * @param {Object} config workbox config
 * @param {Request} req incoming HTTP request
 * @return {Object} config which will be deeply merged
 */
function workboxHook(gasket, config, req) {
  return {
    runtimeCache: [{
      urlPattern: /https:\/\/some.api.com/,
      handler: 'networkFirst'
    }]
  };
}
```

[`@gasket/resolve`]: /packages/gasket-resolve
[`@gasket/engine`]: /packages/gasket-plugin-engine#gasketapi
