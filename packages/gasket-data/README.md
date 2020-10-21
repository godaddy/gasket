# @gasket/data

Helper package for accessing embedded Gasket Data in the browser.

## Installation

```
npm i @gasket/data
```

## Usage

This helper is intended for use in conjunction with Gasket Data embedded in a
script tag in the html document.

For example, if the following data is rendered...

```html
<script id="GasketData" type="application/json">{ "something": "interesting" }</script>
```

...then it would be accessible as:

```js
import gasketData from '@gasket/data';

console.log(gasketData.something); // interesting
```

### Adding SSR Data

To make data available for server-side rendering options, plugins should add to
the `res.locals.gasketData` object.

For example when using the [middleware lifecycle] in a plugin:

```js
module.exports = {
  hooks: {
    middleware() {
      return (req, res, next) => {
        res.locals.gasketData = res.locals.gasketData || {};
        res.locals.gasketData.example = { fake: 'data' }; 
        next();
      }
    }
  }
};
```

The results of `res.locals.gasketData` should then be rendering in a script as
described above.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[middleware lifecycle]:/packages/gasket-plugin-express/README.md#middleware

