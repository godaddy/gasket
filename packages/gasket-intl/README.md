# @gasket/intl

React component library to enable localization for Gasket apps.

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

- `localesPath` - (string) Path to endpoint with JSON files. See [Locale Paths].
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

- `localesPath` - (string) Path to endpoint with JSON files. See [Locale Paths].
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

### getStaticProps

To generate static pages for a locale in a Next.js app, you can use
`intlGetStaticProps` to make a [getStaticProps] function that will take a
`locale` param.

**Signature**

- `intlGetStaticProps(localesPath)`

**Props**

- `localesPath` - (string) Path to endpoint with JSON files. See [Locale Paths].

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

- `localesPath` - (string) Path to endpoint with JSON files. See [Locale Paths].

```jsx
import { intlGetServerSideProps } from '@gasket/intl/next';
import { FormattedMessage } from 'react-intl';

export default const Component = props => <h1><FormattedMessage id='welcome'/></h1>

export default Component;

export const getServerSideProps = intlGetServerSideProps('/locales');
```

## Locale Paths

To let the various components and functions, you can set a `localesPath`. This
should be the URL endpoint where static JSON files are available.

For example, lets say we are serving the following locale files:

```
locales
├── en.json
└── fr.json
```

With this structure, the `localesPath` should be `/locales`.

When a component or function then needs to fetch translations for a given
locale, say `en`, it will take the `localesPath`, and append the locale name
with `.json` extension.

### Split Locales

JSON locale files can be split up and loaded as needed to tune an app's
performance. For example, say you have a heavy component with lots of translated
text. This heavy component is not used on the main page, so we can download
those translations later to improve our initial page load.

```
locales
├── en.json
├── fr.json
└── heavy-component
    ├── en.json
    └── fr.json
```

We would then set the `localesPath` to `/locales/heavy-component`, using one of
our locale required components:

```jsx
import { withLocaleRequired } from '@gasket/intl';
import { FormattedMessage } from 'react-intl';

const HeavyComponent = props => <p><FormattedMessage id='long-description'/></p>

export default withLocaleRequired('/locales/heavy-component')(HeavyComponent);
```

### Template Paths

As an alternative to the above `<group>/<locale>.json` structural format, an app
could also organize files by `<locale>/<group>.json`. In this case, the
`localesPath` must be specified with `locale` as a path param.

For example, lets say we are serving the following locale files:

```
locales
├── en
    ├── common.json
    └── heavy-component.json
├── fr
    ├── common.json
    └── heavy-component.json
```

We would then set the `localesPath` to `/locales/:locale/heavy-component.json`.

Now, when a component or function then needs to load translations for a given
locale, say `en`, it will substitute it in for the `:locale` param in the path.

### Locale Fallbacks

Before a locale path is loaded, it's existence is first checked against the
[locales manifest] provided by [@gasket/plugin-intl]. If it does not exist, a
fallback will be attempted, lastly resorting to the [default locale].

The way the fallback works, is if a locale includes both language and region
parts, it will try just the language before going to the `defaultLocale`.

For example, say our defaultLocale is `en-US`, and we have locale files for `en`
and `fr`. If we have a request for a page with the locale `fr-CH`, our fallback
would occur as:

```
fr-CH -> fr
```

Say we have another request for `de-CH`. Since we do not have locale files for
either `de-CH` or `de`, only `en`, our fallback would look like:

```
de-CH -> de -> en-US -> en
               └── (default)
```

Locales can also be directly mapped to other locales which an app has known
locale files for. The [locales map] is declared in the gasket config for the
[@gasket/plugin-intl].

<!-- LINKS -->

[withIntlProvider]:#withintlprovider
[withLocaleRequired]:#withlocalerequired
[LocaleRequired]:#localerequired
[Locale Paths]:#locale-paths
[split locales]:#split-locales

[@gasket/plugin-intl]:/packages/gasket-plugin-intl/README.md
[locales manifest]:/packages/gasket-plugin-intl/README.md#locales-manifest
[locales map]:/packages/gasket-plugin-intl/README.md#locales-map
[default locale]:/packages/gasket-plugin-intl/README.md#default-locale

[react-intl]:https://formatjs.io/docs/react-intl
[getStaticProps]:https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation
[getServerSideProps]:https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering

## License

[MIT](./LICENSE.md)
