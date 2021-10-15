# @gasket/nextjs

Gasket integrations for Next.js apps.

## Installation

```
npm i @gasket/nextjs
```

## Components

### withGasketData

Use this to extend your Next.js Document to automatically inject a script
containing the `gasketData` for use with the [@gasket/data] package.

**Signature**

- `withGasketData(options)(Document)`

**Props**

- `[options]` - (object) Optional configuration
  - `index` - (number) Force the script to be inject at a certain child index of
    the body

#### Example

This is the simplest and most common setup:

```jsx
// pages/_document.js
import Document from 'next/document';
import { withGasketData } from '@gasket/nextjs';

export default withGasketData()(Document);
```

By default this will inject the script in the `<body/>` after the Next.js
`<Main/>` component, but before `<NextScript/>`. This also works for a
[custom Document].

#### Example forced index

However, there may be situations where you want to inject the `gasketData`
script at a particular child index of the `<body/>`. To do so, you can set the
`index` in the decorator options.


```jsx
// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { withGasketData } from '@gasket/nextjs';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <footer>Some custom content</footer>
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default withGasketData({ index: 2 })(MyDocument);
```

In this example, the `gasketData` script will be injected after the custom
`<footer/>` instead of right after `<Main/>`.

This is especially useful if you are somehow nesting or extending the `<Main/>`
and `<NextScript/>` components and the decorator cannot find the right place to
inject the script.


---
### `withGasketDataProvider` and `useGasketData`

- `withGasketDataProvider`: Inject gasket data in to provider context to share the gasketData with the `useGasketData` hook. This is SSR and client side friendly
- `useGasketData`: Hook that utilizes the context shared with the `withGasketData` HOC. Gives access to the gasketData.

### Example

---
>
>```jsx
>// pages/_app.js
>import { AppProps } from 'next/app';
>import { withGasketDataProvider } from '@gasket/nextjs';
>
>
>const Root = ({ Page, pageProps }) => {
>  return (
>    <Page {...pageProps} />
>  );
>};
>
>export default withGasketDataProvider(Root);
>```
>
>
>```jsx
>// MyComponent.js
>import { useGasketData } from '@gasket/nextjs';
>
>
>export const MyComponent = (props) => {
>  const gasketData = useGasketData();
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

[@gasket/data]: /packages/gasket-data/README.md

[custom Document]: https://nextjs.org/docs/advanced-features/custom-document

