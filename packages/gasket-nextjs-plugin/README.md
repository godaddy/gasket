# @gasket/plugin-nextjs

This plugin adds `next` to your application.

## Installation

```
npm install --save @gasket/plugin-nextjs
```

## Configuration

The nextjs plugin is configured using the `gasket.config.js` file.

- First, add it to the `plugins` section of your `gasket.config.js`:

```js
module.exports = {
  plugins: {
    add: ['@gasket/nextjs']
  }
}
```

- Instead of adding a dedicated `next.config.js`, the `next` property within `gasket.config.js` is used. Everything you can configure in the [next.config][next.config] can be added here.

#### Example configuration

```js
module.exports = {
  plugins: {
    add: ['@gasket/nextjs']
  },
  next: {
    poweredByHeader: false,
    useFileSystemPublicRoutes: false,
    generateBuildId: () => Date.now()
  }
}
```

## Hooks

`nextjs` hooks into the following lifecycles in order to work.

#### nextCreate

```js
module.exports = {
  hooks: {
    /**
    * Creates the next app
    * @param  {Gasket} gasket The Gasket API
    * @return {Promise<Object>} next app
    */
    nextCreate: async function createNext(gasket) {
      return nextApp;
    }
  }
};
```

#### nextBuild

```js
module.exports = {
  hooks: {
    /**
    * Builds next app
    * @param  {Gasket} gasket The Gasket API
    * @return {Promise<Object>} next build
    */
    nextBuild: async function createBuild(gasket) {
      return build;
    }
  }
};
```

## Lifecycles

#### next

Executed when the `next` server has been created. It will receive a reference to
the created `next` instance.

```js
module.exports = {
  hooks: {
    /**
    * Modify the Next app instance
    * @param  {Gasket} gasket The Gasket API
    * @param  {Next} next Next app instance
    */
    next: function next(gasket, next) {
      next.setAssetPrefix('https://my.cdn.com/dir/');
    }
  }
}
```

#### nextConfig

Executed before the `next` server has been created. It will receive a reference to the `next` config.
This will allow you to modify the `next` config before the `next` server is created.

```js
module.exports = {
  hooks: {
    /**
    * Modify the Next config
    * @param  {Gasket} gasket The Gasket API
    * @param  {Object} config Next config
    * @returns {Object} config
    */
    nextConfig(gasket, config) {
      return {
        ...config,
        modification: 'newValue'
      };
    }
  }
}
```

[next.config]: https://nextjs.org/docs#custom-configuration
