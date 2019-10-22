# @gasket/fastify-plugin

The `fastify-plugin` adds `fastify` to your application.

## Installation

```sh
npm install --save @gasket/fastify-plugin
```

## Configuration

The fastify plugin is configured using the `gasket.config.js` file.

- First, add it to the `plugins` section of your `gasket.config.js`:

```js
{
  "plugins": [
    "add": ["fastify"]
  ]
}
```

All the configurations for the plugin are added under `fastify` in the config:

- `compression`: true by default. Can to set to false if applying compression differently.
- `excludedRoutesRegex`: Regex of the routes to exclude by fastify.

#### Example configuration

```js
module.exports = {
  plugins: {
    add: ['fastify']
  },
  fastify: {
    compression: false,
    excludedRoutesRegex: /^(?!\/_next\/)/
  }
}
```

## Hooks

`fastify` hooks into the following lifecycle in order to work.

#### createServers

```js
module.exports = {
  name: 'fastify',
  hooks: {
    /**
    * Creates the fastify app
    * @param  {Gasket} gasket The Gasket API
    * @param  {Object} serverOpts Server options.
    * @return {Promise<Object>} fastify app
    */
    'createServers': async function createServers(gasket, serverOpts) {
      return { ...serverOpts, handler: fastify() };
    }
  }
};
```

## Lifecycles

#### middleware

Executed when the `fastify` server has been created, it will apply all returned
functions as middleware.

```js
module.exports = {
  hooks: {
    /**
    * Add Fastify middleware
    *
    * @param {Gasket} gasket The Gasket API
    * @param {Fastify} app - Fastify app instance
    * @returns {function|function[]} middleware(s)
    */
    middleware: function (gasket, app) {
      return require('x-xss-protection')();
    }
  }
}
```

You may also return an `Array` to inject more than one middleware.

#### fastify

Executed **after** the `middleware` event for when you need full control over
the `fastify` instance.

```js
module.exports = {
  hooks: {
    /**
    * Update Fastify app instance
    *
    * @param {Gasket} gasket The Gasket API
    * @param {Fastify} fastify Fastify app instance
    * @returns {function|function[]} middleware(s)
    */
    fastify: async function (gasket, fastify) {
      fastify.get('/🐰🥚', (req, res) => {
        res.send('⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️');
      })
    }
  }
}
```

#### errorMiddleware

Executed after the `fastify` event. All middleware functions returned from
this hook will be applied to fastify.

```js
module.exports = {
  hooks: {
    /**
    * Add Fastify error middlewares
    *
    * @param {Gasket} gasket The Gasket API
    * @returns {function|function[]} error middleware(s)
    */
    errorMiddleware: function (gasket) {
    }
  }
}
```
