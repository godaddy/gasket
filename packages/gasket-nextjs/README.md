# @gasket/nextjs

Gasket integrations for Next.js apps. Provides several tools:

- request: Access a request-like object in server components
- withGasketData: Injects Gasket Data added during lifecycle into Document
- withGasketDataProvider: Provides context access to Gasket Data
- useGasketData: Allows access to Gasket Data from hook

## Installation

```
npm i @gasket/nextjs
```

## Functions

### request

Get a request-like object unique to the current request in server components.
This uses the Next.js `cookies()` and `headers()` [dynamic functions]. 

**Signature**

- `request(query?: object): { headers: object, cookies: object, query?: object }`

**Props**

- `[query]` - (object) Optional query object

Many GasketActions are designed to be unique to requests.
When using ServerComponents with Next.js, the incoming request object is not
fully accessible. This function provides a way to get a request-like object
that can be used in ServerComponents.

#### Example

```js
import { request } from '@gasket/nextjs/server';
import gasket from '../gasket.mjs'

export default async function MyPage() {
  const req = request();
  const something = await gasket.actions.getSomething(req);
  
  return <div>{ something.fancy }</div>;
}
```

The `req` will contain an object with headers and cookies.

If a query object is passed in, it will be added to the request object as well.
For server components, dynamic routes params are available via props, and can
be passed to the `request` function to make those path params available as the
query.

```js
import { request } from '@gasket/nextjs/server';
import gasket from '../gasket.mjs'

export default async function MyDynamicRoutePage({ params }) {
  const req = request(params);
  const something = await gasket.actions.getSomething(req);
  
  return <div>{ something.fancy }</div>;
}
```

## Components

### withGasketData

Use this to extend your Next.js Document to automatically inject a script containing the `gasketData` for use with
the [@gasket/data] package.

**Signature**

- `withGasketData(options)(Document)`

**Props**

- `[options]` - (object) Optional configuration
    - `index` - (number) Force the script to be inject at a certain child index of the body

#### Example

This is the simplest and most common setup:

```jsx
// pages/_document.js
import Document from 'next/document';
import { withGasketData } from '@gasket/nextjs/document';
import gasket from '../gasket.js';

export default withGasketData(gasket)(Document);
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
import Document, {Html, Head, Main, NextScript} from 'next/document'
import { withGasketData } from '@gasket/nextjs/document';
import gasket from '../gasket.js';

class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx)
        return {...initialProps}
    }

    render() {
        return (
            <Html>
                <Head/>
                <body>
                <Main/>
                <footer>Some custom content</footer>
                <NextScript/>
                </body>
            </Html>
        )
    }
}

export default withGasketData(gasket, {index: 2})(MyDocument);
```

In this example, the `gasketData` script will be injected after the custom
`<footer/>` instead of right after `<Main/>`.

This is especially useful if you are somehow nesting or extending the `<Main/>`
and `<NextScript/>` components and the decorator cannot find the right place to inject the script.


---

### withGasketDataProvider

Use this to inject gasket data in to provider context to share the gasketData with the `useGasketData` hook. This is SSR
and client side friendly and can be added at the app level or component level.

#### Example

---

```jsx
// pages/_app.js
import { AppProps } from 'next/app';
import { withGasketDataProvider } from '@gasket/nextjs';


const Root = ({ Page, pageProps }) => {
  return (
    <Page {...pageProps} />
  );
};

export default withGasketDataProvider()(Root);
```

### useGasketData

Use this hook to access the gasketData provided by the `withGasketDataProvider` hoc.

#### Example


```jsx
// MyComponent.js
import { useGasketData } from '@gasket/nextjs';


export const MyComponent = (props) => {
  const gasketData = useGasketData();

  return (
    <>
      <div>{gasketData.something}</div>
      <div>{gasketData.here}</div>
    </>
  );
};
```

## How it works

During server side lifecycles' data can be added to the gasketData property. When the `withGasketData` hoc is added to a custom Next.js _document, the gasketData is added to the rendered html inside a script tag.

The `withGasketDataProvider` can be added to a Next.js custom _app or react component. This HOC will capture the gasket data from server side gasketData property or the script tag that was rendered to the html. If Next.js is preforming a SSR the data will come from the gasketData property, otherwise the data will come from the script tag. The `withGasketDataProvider` hoc will then create a provider and inject gasket data into a context that can be consumed by the `useGasketData` hook.

The `useGasketData` will provided access to the gasket data within the context of the `withGasketDataProvider` so the data can be used within any react component.

> Please see @gasket/data docs for examples on adding data during SSR lifecycle


## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[@gasket/data]: /packages/gasket-data/README.md

[custom Document]: https://nextjs.org/docs/advanced-features/custom-document
[dynamic functions]: https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-functions

