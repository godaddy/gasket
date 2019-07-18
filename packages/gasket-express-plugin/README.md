# @gasket/express-plugin

The `express-plugin` adds `express` to your application.

## Installation

```
npm install --save @gasket/express-plugin
```

## Configuration

The express plugin is configured using the `gasket.config.js` file.

- First, add it to the `plugins` section of your `gasket.config.js`:

```js
{
  "plugins": [
    "add": ["express"]
  ]
}
```

All the configurations for the plugin are added under `express` in the config:

- `compression`: true by default. Can to set to false if applying compression differently.
- `excludedRoutesRegex`: Regex of the routes to exclude by express.

#### Example configuration

```js
module.exports = {
  plugins: {
    add: ['express']
  },
  express: {
    compression: false,
    excludedRoutesRegex: /^(?!\/_next\/)/
  }
}
```

## Hooks

`express` hooks into the following lifecycle in order to work.

#### expressCreate

```js
module.exports = {
  name: 'express',
  hooks: {
    /**
    * Creates the express app
    * @param  {Gasket} gasket The Gasket API
    * @return {Promise<Object>} express app
    */
    'expressCreate': async function createExpress(gasket, devServer) {
      return express();
    }
  }
};
```

## Lifecycles

#### middleware

Executed when the `express` server has been created, it will apply all returned
functions as middleware.

```js
module.exports = {
  hooks: {
    /**
    * Add Express middleware
    * 
    * @param {Gasket} gasket The Gasket API
    * @param {Express} app - Express app instance
    * @returns {function|function[]} middleware(s)
    */
    middleware: function (gasket, app) {
      return require('x-xss-protection')();
    }
  }
}
```

You may also return an `Array` to inject more than one middleware.

#### express

Executed **after** the `middleware` event for when you need full control over
the `express` instance.

```js
module.exports = {
  hooks: {
    /**
    * Update Express app instance
    * 
    * @param {Gasket} gasket The Gasket API
    * @param {Express} express - Express app instance
    * @returns {function|function[]} middleware(s)
    */
    express: async function (gasket, express) {
    }
  }
}
```
