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
import { gasketData } from '@gasket/data';

console.log(gasketData().something); // interesting
```

Note that `@gasket/data` is only expected to be used in the browser, and not in
server-side code.

### Adding Data

To add to the data exposed in `@gasket/data`, see the [@gasket/plugin-data] documentation and the [publicGasketData] lifecycle.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[script tag]:https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
[@gasket/plugin-data]:/packages/gasket-plugin-data/README.md
[publicGasketData]:/packages/gasket-plugin-data#publicgasketdata
