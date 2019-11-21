# @gasket/nextjs-plugin

This plugin adds Next.js to your application.

## Installation

```
npm install --save @gasket/nextjs-plugin
```

## Configuration

Add the plugin to the `plugins` section of your `gasket.config.js`:

```js
module.exports = {
  plugins: {
    add: ['nextjs']
  }
}
```

Next.js can be configured in a couple of ways when used with Gasket. The primary
way is for plugins to hook the [nextConfig lifecycle] as explained below.

It is also possible for apps to config Next.js using the `gasket.config.js`
file. To do so, specify a `nextConfig` object property in the same form as what
you would set for [custom configurations] or using Next.js plugins.

For general Webpack configurations, it is recommend to utilize features of the
Gasket [webpack plugin].

### Example

```js
module.exports = {
  plugins: {
    add: ['nextjs']
  },
  nextConfig: {
    useFileSystemPublicRoutes: false,
    generateBuildId: () => Date.now()
  }
}
```

### Example with plugins

```js
const withSass = require('@zeit/next-sass');
const withCss = require('@zeit/next-css');

module.exports = {
  plugins: {
    add: ['nextjs']
  },
  nextConfig: withCss(withSass({
    /* config options here */
  }))
}
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

Executed before the `next` server has been created. It will receive a reference
to the `next` config. This will allow you to modify the `next` config before the
`next` server is created.

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

### nextExpress

Provides access to both `next` and `express` instances which allows
`next.render` calls in express-based routes.

```js
module.exports = {
  hooks: {
    nextExpress: function (gasket, { next, express }) {
      express.post('/contact-form', (req, res) => {
        // DO STUFF WITH RECEIVED DATA
        //
        // And once we're done, we can `next.render` to render the `pages/thanks`
        // file as a response.
        next.render(req, res, '/thanks', req.params);
      });
    }
  }
}
```

[nextConfig lifecycle]:#nextconfig
[custom configurations]: https://nextjs.org/docs#custom-configuration
[webpack plugin]:/packages/gasket-webpack-plugin/README.md
