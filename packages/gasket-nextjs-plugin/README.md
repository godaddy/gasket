# @gasket/nextjs-plugin

The `nextjs-plugin` adds `next` to your application.

## Installation

```
npm install --save @gasket/nextjs-plugin
```

## Configuration

The nextjs plugin is configured using the `gasket.config.js` file.

- First, add it to the `plugins` section of your `gasket.config.js`:

```js
{
  "plugins": [
    "add": ["nextjs"]
  ]
}
```

- Instead of adding a dedicated `next.config.js`, the `next` property within `gasket.config.js` is used. Everything you can configure in the [next.config][next.config] can be added here.

#### Example configuration

```js
module.exports = {
  plugins: {
    add: ['nextjs']
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
  name: 'nextjs',
  hooks: {
    /**
    * Creates the next app
    * @param  {Gasket} gasket The Gasket API
    * @param {Servers} devServer true or false
    * @return {Promise<Object>} next app
    */
    'nextCreate': async function createNext(gasket, devServer) {
      return nextApp;
    }
  }
};
```

#### nextBuild

```js
module.exports = {
  name: 'nextjs',
  hooks: {
    /**
    * Builds next app
    * @param  {Gasket} gasket The Gasket API
    * @return {Promise<Object>} next build
    */
    'nextBuild': async function createBuild(gasket) {
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
    next: function (gasket, next) {
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
