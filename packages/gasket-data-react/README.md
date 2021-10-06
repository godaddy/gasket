# @gasket/data-react

Helper package for accessing embedded Gasket Data in the browser when using react and NextJS.

## Installation

```
npm i @gasket/data-react
```

## Usage

This helper is intended for use in conjunction with @gasket/data and assists with SSR for react apps.


### Usage
#### Example 1
```js
// pages/_app.js
const Root = ({ Page, pageProps }) => {
  return (
    <Page {...pageProps} />
  );
};

export default withGasketData(Root);
```

```js
// MyComponent.js
import {useGasketData} from '@gasket/data-react';

export const MyComponent = (props) => {
  const gasketData = useGasketData();
  
  return (
    <div>{gasketData.test}</div>
  );
};
```


#### Example 2
```tsx
// pages/_app.tsx
import { AppProps } from 'next/app';

interface GasketAppProps extends AppProps {
    Page: React.ComponentType;
}

const Root = ({ Page, pageProps }: GasketAppProps) => {
  return (
    <Page {...pageProps} />
  );
};

export default withGasketData(Root);
```

```tsx
// MyComponent.tsx
import {useGasketData} from '@gasket/data-react';

type MyGasketDate = {
    test: string
}

export const MyComponent = (props) => {
  const gasketData = useGasketData<MyGasketDate>();
  
  return (
    <div>{gasketData.test}</div>
  );
};
```

### Adding SSR Data

> Please see @gasket/data docs

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


## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[middleware lifecycle]:/packages/gasket-plugin-express/README.md#middleware
[script tag]:https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
