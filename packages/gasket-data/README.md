# @gasket/data

Helper package for accessing embedded Gasket Data in the browser.

## Installation

```
npm i @gasket/data
```

## Usage

This helper is intended for use in conjunction with Gasket Data embedded in a
[script tag] in the HTML document.

For example, if the following data is rendered...

```html
<script id="GasketData" type="application/json">{ "something": "interesting" }</script>
```

...then it would be accessible as:

```js
import gasketData from '@gasket/data';

console.log(gasketData.something); // interesting
```

Note that `@gasket/data` is only expected to be used in the browser, and not in
server-side code.

### Adding Data

To add to the data exposed in `@gasket/data`, you can write to the HTTP response
object's `locals.gasketData` property.
For example, when using the [middleware lifecycle] in a plugin:

```js
module.exports = {
  hooks: {
    middleware(gasket, app) {
      return (req, res, next) => {
        res.locals.gasketData = res.locals.gasketData || {};
        res.locals.gasketData.example = { fake: 'data' }; 
        next();
      }
    }
  }
};
```

The results of `res.locals.gasketData` should then be rendering in a script
as described above.
Similarly, this can be done in an application lifecycle script:

```js
// /lifecycles/middleware.js

module.exports = (gasket, app) => [
  (req, res, next) => {
    res.locals.gasketData ??= {};
    res.locals.gasketData.example = gasket.config.somethingWeWantToExpose;
  }
];
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[middleware lifecycle]:/packages/gasket-plugin-express/README.md#middleware
[script tag]:https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
