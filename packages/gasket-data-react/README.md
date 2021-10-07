# @gasket/data-react

Helper package for accessing embedded Gasket Data in the browser when using react and NextJS.

## Installation

```
npm i @gasket/data-react
```

## Components

- `withGasketData`: Inject gasket data in to page using `getInitialProps`. This is SSR and client side friendly
- `GasketDataProvider`: Creates provider context to share the based in gasketData with the `useGasketData` component
- `useGasketData`: Hook that utilizes the context shared with the `GasketDataProvider` component. Allows access to the
  data in all react components

## Usage

This helper is intended for use in conjunction with @gasket/data and assists with SSR for react apps.

# Example

---
>## `withGasketData` Example
>
>```tsx
>// pages/_app.tsx
>import { AppProps } from 'next/app';
>import { withGasketData, withGasketDataProps } from '@gasket/data-react';
>
>interface MyGasketData {
>  something: string,
>  here: string
>}
>
>interface GasketAppProps extends AppProps, withGasketDataProps<MyGasketData> {
>  Page: React.ComponentType;
>}
>
>const Root = ({ Page, pageProps, gasketData }: GasketAppProps) => {
>
>  /**
>   * Do something with the gasketData
>   * ...
>   * ...
>   */
>
>  return (
>    <Page {...pageProps} />
>  );
>};
>
>export default withGasketData(Root);
>```

---

> ## `useGasketData` example
>
>```tsx
>// pages/_app.tsx
>import { AppProps } from 'next/app';
>import { withGasketData, withGasketDataProps } from '@gasket/data-react';
>import { GasketDataProvider } from './GasketDataProvider';
>
>interface GasketAppProps extends AppProps, withGasketDataProps {
>  Page: React.ComponentType;
>}
>
>const Root = ({ Page, pageProps, gasketData }: GasketAppProps) => {
>  return (
>    <GasketDataProvider gasketData={gasketData}>
>      <Page {...pageProps} />
>    </GasketDataProvider>
>  );
>};
>
>export default withGasketData(Root);
>```
>
>
>```tsx
>// MyComponent.tsx
>import { useGasketData } from '@gasket/data-react';
>
>interface MyGasketData {
>  something: string,
>  here: string
>}
>
>export const MyComponent = (props) => {
>  const gasketData = useGasketData<MyGasketData>();
>
>  return (
>    <>
>      <div>{gasketData.something}</div>
>      <div>{gasketData.here}</div>
>    </>
>  );
>};
>```

### Adding SSR Data

> Please see @gasket/data docs

To make data available for server-side rendering options, plugins should add to the `res.locals.gasketData` object.

For example when using the [middleware lifecycle] in a plugin:

```js
module.exports = {
  hooks: {
    middleware() {
      return (req, res, next) => {
        res.locals.gasketData         = res.locals.gasketData || {};
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
