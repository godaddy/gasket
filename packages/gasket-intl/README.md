# @gasket/intl

React component library to enable localization for Gasket apps. Loads and
manages locale files from [@gasket/plugin-intl].

## Installation

```
npm i @gasket/intl
```

## Components

- [withIntlProvider]
- [withLocaleRequired]
- [LocaleRequired]

### withIntlProvider

Use this to wrap an app to set up the Provider for [react-intl] and context for
the locale components below.

**Signature**

- `withIntlProvider(options)`

**Props**

- `[options]` - (object) Optional configuration - currently not used

```jsx
import { withIntlProvider } from '@gasket/intl';

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

#### Example

```jsx
import { withLocaleRequired } from '@gasket/intl';
import { FormattedMessage } from 'react-intl';

const Component = props => <h1><FormattedMessage id='welcome'/></h1>

export default withLocaleRequired('/locales')(Component);
```

### LocaleRequired

Locale files can also be required by component. This can be useful for
components that want to render certain quickly, while deferring rendering other
content until a [split locales] file loads.

**Signature**

- `<LocaleRequired { ...props } />`

**Props**

- `localesPath` - (string) Path to endpoint with JSON files. See more about
  [locales path] in the plugin docs.
- `loading` - (string|node) Content to render while loading, otherwise null.

```jsx
import { LocaleRequired } from '@gasket/intl';
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
`@gasket/intl/next`.

### getStaticProps

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
import { intlGetStaticProps } from '@gasket/intl/next';
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
param. The generated pages will be for `/en/example`, and `/fr/example`.

### getServerSideProps

Locale files can also be preloaded for server-side rendering using
`intlGetServerSideProps` to make a [getServerSideProps] function. The locale to
be loaded will come from the `res.gasketData` provided by [@gasket/plugin-intl].

**Signature**

- `intlGetServerSideProps(localesPath)`

**Props**

- `localesPath` - (string) Path to endpoint with JSON files. See more about
  [locales path] in the plugin docs.

```jsx
import { intlGetServerSideProps } from '@gasket/intl/next';
import { FormattedMessage } from 'react-intl';

export default const Component = props => <h1><FormattedMessage id='welcome'/></h1>

export default Component;

export const getServerSideProps = intlGetServerSideProps('/locales');
```

<!-- LINKS -->

[withIntlProvider]:#withintlprovider
[withLocaleRequired]:#withlocalerequired
[LocaleRequired]:#localerequired

[@gasket/plugin-intl]:/packages/gasket-plugin-intl/README.md
[locales path]:/packages/gasket-plugin-intl/README.md#locales-path
[split locales]:/packages/gasket-plugin-intl/README.md#split-locales

[react-intl]:https://formatjs.io/docs/react-intl
[getStaticProps]:https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation
[getServerSideProps]:https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering

## License

[MIT](./LICENSE.md)
