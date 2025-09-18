# @gasket/react-intl

React component library to enable localization for Gasket apps. Loads and
manages locale files from [@gasket/plugin-intl].

- React components:
  - [withMessagesProvider]
  - [withLocaleFileRequired]
  - [LocaleFileRequired]

- React hooks:
  - [useMessages]
  - [useLocaleFile]

## Installation

```
npm i @gasket/react-intl
```

## Components

### withMessagesProvider

Use this to wrap a component to provide messages through context and/or set up
an intl provider such as [react-intl].

**Signature**

- `withMessagesProvider(intlManager, options?)(Component)`

**Props**

- `intlManager` - (object) An instance of the intl manager created by
  [@gasket/plugin-intl].
- `[options]` - (object) Optional configuration


#### Example [react-intl] using Next.js i18n routing

```jsx
// pages/_app.js
import { useRouter } from 'next/router';
import { IntlProvider } from 'react-intl';
import { withMessagesProvider } from '@gasket/react-intl';
import intlManager from '../path/to/intl.js';

const IntlMessagesProvider = withMessagesProvider(intlManager)(IntlProvider);

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  return (
    <IntlMessagesProvider locale={router.locale}>
      <Component {...pageProps} />
    </IntlMessagesProvider>
  );
}
```

#### Example Next.js App using locale prop

With [@gasket/plugin-intl] and [@gasket/nextjs], the locale can be passed as a prop
to the App component using `withLocaleInitialProps`. This is useful if you want to
use `getInitialProps` for your app or pages.

```jsx
// pages/_app.js
import { IntlProvider } from 'react-intl';
import { withMessagesProvider } from '@gasket/react-intl';
import intlManager from '../path/to/intl.js';

const IntlMessagesProvider = withMessagesProvider(intlManager)(IntlProvider);

function App({ Component, pageProps, locale }) {  
  return (
    <IntlMessagesProvider locale={ locale }>
      <Component { ...pageProps } />
    </IntlMessagesProvider>
  );
}

export default withLocaleInitialProps(gasket)(App);
```

#### Example with custom provider

You can wrap any intl provider, passing the messages and locale as props.

```jsx
import { withMessagesProvider } from '@gasket/react-intl';
import intlManager from '../path/to/intl.js';

const IntlMessagesProvider = withMessagesProvider(intlManager)(
  function CustomWrapper({ locale, messages, children }) {
    return <CustomIntlProvider messages={messages} locale={locale}>
        {children}
      </CustomIntlProvider>
  }
);
```

### withLocaleFileRequired

Higher-order component to wrap pages or components in an app. This checks to see
if a locale file has been loaded, and fetches it if not. Once loaded, the
wrapped component will be rendered.

**Signature**

- `withLocaleFileRequired(localeFilePath, options)`

**Props**

- `localeFilePath` - (string|string[]) The [locale file path] to load.
- `[options]` - (object) Optional configuration
  - `loading` - (string|node) Content to render while loading, otherwise null.
  - `forwardRef` - (boolean) Add a ref to the connected wrapper component.

#### Example

```jsx
import { withLocaleFileRequired } from '@gasket/react-intl';
import { FormattedMessage } from 'react-intl';

const Component = props => <h1><FormattedMessage id='welcome'/></h1>

export default withLocaleFileRequired('/locales/extra')(Component);
```

### LocaleFileRequired

This component can also require locale files. This can be useful for components
that want to render certain content quickly, while deferring rendering other
content until a [dynamic locale file] loads.

**Signature**

- `<LocaleFileRequired { ...props } />`

**Props**

- `localeFilePath` - (string|string[]) The [locale file path] to load.
- `loading` - (string|node) Content to render while loading, otherwise null.

```jsx
import { LocaleFileRequired } from '@gasket/react-intl';
import { FormattedMessage } from 'react-intl';

const Component = props => (
  <>
    <LocaleFileRequired localeFilePath='/locales'>
      <h1><FormattedMessage id='welcome'/></h1>
    </LocaleFileRequired>
    <LocaleFileRequired localeFilePath='/locales/paragraphs' loading='Loading...'>
      <p><FormattedMessage id='long-description'/></p>
    </LocaleFileRequired>
  </>
)

export default Component;
```

## Hooks

### useMessages

This hook will return an object containing all messages for the current locale.

**Signature**

- `useMessages(): Messages`

```jsx
import {
  useMessages
} from '@gasket/react-intl';

export default function MyComponent(props) {
  const messages = useMessages();

  return <p>{ messages.welcome }</p>;
}
````

### useLocaleFile

Use this hook when you need more control versus what the components provide.
The hook will return the current loading status of the dynamic locale file(s).

**Signature**

- `useLocaleFile(...localeFilePath): loadState`

**Props**

- `localeFilePath` - (...string[]) One or more [locale file path] to load.

```jsx
import {
  useLocaleFile,
  LocaleFileStatus,
  useMessages
} from '@gasket/react-intl';

export default function MyComponent(props) {
  const status = useLocaleFile('/locales/custom');
  const messages = useMessages();
  
  if (status === LocaleFileStatus.error) return 'Could not translate.';
  if (status !== LocaleFileStatus.loaded) return 'Fetching translations...';

  return <p>{ messages.custom_welcome }</p>;
}
```

<!-- LINKS -->

[withMessagesProvider]:#withmessagesprovider
[withLocaleFileRequired]:#withlocalefilerequired
[LocaleFileRequired]:#localefilerequired
[useLocaleFile]:#uselocalefile
[useMessages]:#usemessages

[@gasket/plugin-intl]:/packages/gasket-plugin-intl/README.md
[@gasket/nextjs]:/packages/gasket-nextjs/README.md
[locale file path]:/packages/gasket-plugin-intl/README.md#locale-file-path
[dynamic locale file]:/packages/gasket-plugin-intl/README.md#dynamic-locale-files

[react-intl]:https://formatjs.io/docs/react-intl

## License

[MIT](./LICENSE.md)
