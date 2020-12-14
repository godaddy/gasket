# @gasket/react-intl

React component library to enable localization for Gasket apps. Loads and
manages locale files from [@gasket/plugin-intl].

- React components:
  - [withIntlProvider]
  - [withLocaleRequired]
  - [LocaleRequired]

- Next.js functions:
  - [intlGetStaticProps]
  - [intlGetServerSideProps]

## Installation

```
npm i @gasket/react-intl
```

## Components

### withIntlProvider

Use this to wrap an app to set up the Provider for [react-intl] and context for
the locale components below.

**Signature**

- `withIntlProvider(options)`

**Props**

- `[options]` - (object) Optional configuration - currently not used

```jsx
import { withIntlProvider } from '@gasket/react-intl';

const App = props => <div>{props.children}</div>

export default withIntlProvider()(App);
```

### withLocaleRequired

Higher-order component to wrap pages or components in an app. This checks to see
if a locale file has been loaded, and fetches it if not. Once loaded, the
wrapped component will be rendered.

**Signature**

- `withLocaleRequired(localesPath, options)`

**Props**

- `localesPath` - (string) Path to endpoint with JSON files. See more about
  [locales path] in the plugin docs.
- `[options]` - (object) Optional configuration
  - `loading` - (string|node) Content to render while loading, otherwise null.
  - `initialProps` - (boolean) Enable `getInitialProps` to load locale files
    during server-side rendering for Next.js pages. Defaults to `false`.

#### Example

```jsx
import { withLocaleRequired } from '@gasket/react-intl';
import { FormattedMessage } from 'react-intl';

const Component = props => <h1><FormattedMessage id='welcome'/></h1>

export default withLocaleRequired('/locales')(Component);
```

If you only have a single locales path for your app, the default `localesPath`
will be used if unspecified:

```jsx
export default withLocaleRequired()(Component);
```

This is also the behavior for the other components and functions where
`localesPath` can be specified. If the default path for the app should be
something different from `/locales`, this can be set in the config for
[@gasket/plugin-intl].

### LocaleRequired

This component can also require locale files. This can be useful for components
that want to render certain content quickly, while deferring rendering other
content until a [split locales] file loads.

**Signature**

- `<LocaleRequired { ...props } />`

**Props**

- `localesPath` - (string) Path to endpoint with JSON files. See more about
  [locales path] in the plugin docs.
- `loading` - (string|node) Content to render while loading, otherwise null.

```jsx
import { LocaleRequired } from '@gasket/react-intl';
import { FormattedMessage } from 'react-intl';

const Component = props => (
  <>
    <LocaleRequired localesPath='/locales'>
      <h1><FormattedMessage id='welcome'/></h1>
    </LocaleRequired>
    <LocaleRequired localesPath='/locales/paragraphs' loading='Loading...'>
      <p><FormattedMessage id='long-description'/></p>
    </LocaleRequired>
  </>
)

export default Component;
```

## Next.js

Loader functions specific to Next.js lifecycles are available from
`@gasket/react-intl/next`.

### intlGetStaticProps

To generate static pages for a locale in a Next.js app, you can use
`intlGetStaticProps` to make a [getStaticProps] function that will take a
`locale` param.

**Signature**

- `intlGetStaticProps(localesPath)`

**Props**

- `localesPath` - (string) Path to endpoint with JSON files. See more about
  [locales path] in the plugin docs.

```jsx
// pages/[locale]/example.js
import { intlGetStaticProps } from '@gasket/react-intl/next';
import { FormattedMessage } from 'react-intl';

export default const Component = props => <h1><FormattedMessage id='welcome'/></h1>

export default Component;

export const getStaticProps = intlGetStaticProps('/locales');

export function getStaticPaths() {
  return {
    paths: [
      { params: { locale: 'en' } },
      { params: { locale: 'fr' } }
    ],
    fallback: false
  };
}
```

In the above example, we are using Next.js dynamic routes for to set the locale
param. The generated pages will be for `/en/example` and `/fr/example`.

### intlGetServerSideProps

Locale files can also be preloaded for server-side rendering using
`intlGetServerSideProps` to make a [getServerSideProps] function. The locale to
be loaded will come from the `res.gasketData` provided by [@gasket/plugin-intl].

**Signature**

- `intlGetServerSideProps(localesPath)`

**Props**

- `localesPath` - (string) Path to endpoint with JSON files. See more about
  [locales path] in the plugin docs.

```jsx
import { intlGetServerSideProps } from '@gasket/react-intl/next';
import { FormattedMessage } from 'react-intl';

export default const Component = props => <h1><FormattedMessage id='welcome'/></h1>

export default Component;

export const getServerSideProps = intlGetServerSideProps('/locales');
```

One caveat to using `getServerSideProps` is that the locales will be fetched for
page changes in the browser as well. Since a locale file should only be loaded
once for an app, consider using `getInitialProps` instead for loading during
server rendering.

### getInitialProps

To enable `getInitialProps` for preloading locale files during server-side
rendering if Next.js pages, you can set the `initialProps` options to `true`.

#### Example

```jsx
import { withLocaleRequired } from '@gasket/react-intl';
import { FormattedMessage } from 'react-intl';

const Component = props => <h1><FormattedMessage id='welcome'/></h1>

export default withLocaleRequired('/locales', { initialProps: true })(Component);
```

This cannot be combined with `getServerSideProps`, so in those cases where you
need it, another option to preload locale props during SSR is with
[req.withLocaleRequired].

<!-- LINKS -->

[withIntlProvider]:#withintlprovider
[withLocaleRequired]:#withlocalerequired
[LocaleRequired]:#localerequired
[intlGetStaticProps]:#intlgetstaticprops
[intlGetServerSideProps]:#intlgetserversideprops

[@gasket/plugin-intl]:/packages/gasket-plugin-intl/README.md
[locales path]:/packages/gasket-plugin-intl/README.md#locales-path
[split locales]:/packages/gasket-plugin-intl/README.md#split-locales
[req.withLocaleRequired]:/packages/gasket-plugin-intl/README.md#withlocalerequired

[react-intl]:https://formatjs.io/docs/react-intl
[getStaticProps]:https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation
[getServerSideProps]:https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering

## License

[MIT](./LICENSE.md)
