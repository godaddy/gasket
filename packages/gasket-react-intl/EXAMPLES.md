# @gasket/react-intl Examples

This document provides working examples for all exported functions, components, and hooks from `@gasket/react-intl`.

## Table of Contents

- [LocaleFileStatus](#localefilestatus)
- [withMessagesProvider](#withmessagesprovider)
- [useMessages](#usemessages)
- [useLocaleFile](#uselocalefile)
- [LocaleFileRequired](#localefilerrequired)
- [withLocaleFileRequired](#withlocalefilerequired)
- [ensureArray](#ensurearray)
- [needsToLoad](#needstoload)

## LocaleFileStatus

Enum constants representing the status of locale file loading.

```javascript
import { LocaleFileStatus } from '@gasket/react-intl';

// Available status values
console.log(LocaleFileStatus.notHandled); // 'notHandled'
console.log(LocaleFileStatus.notLoaded);  // 'notLoaded'
console.log(LocaleFileStatus.loading);    // 'loading'
console.log(LocaleFileStatus.loaded);     // 'loaded'
console.log(LocaleFileStatus.error);      // 'error'

// Usage in status checking
const status = useLocaleFile('/locales/common');
if (status === LocaleFileStatus.error) {
  console.log('Failed to load locale file');
} else if (status === LocaleFileStatus.loaded) {
  console.log('Locale file loaded successfully');
}
```

## withMessagesProvider

HOC that wraps an intl provider component with locale message loading capabilities.

### Basic Usage

```javascript
import { withMessagesProvider } from '@gasket/react-intl';
import { IntlProvider } from 'react-intl';
import intlManager from '../intl.js';

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

### With Static Locale Files

```javascript
import { withMessagesProvider } from '@gasket/react-intl';
import { IntlProvider } from 'react-intl';
import intlManager from '../intl.js';

const IntlMessagesProvider = withMessagesProvider(intlManager, {
  staticLocaleFilePaths: ['/locales/common', '/locales/navigation']
})(IntlProvider);

export default function App({ Component, pageProps }) {
  return (
    <IntlMessagesProvider locale="en-US">
      <Component {...pageProps} />
    </IntlMessagesProvider>
  );
}
```

### Custom Provider Component

```javascript
import { withMessagesProvider } from '@gasket/react-intl';
import intlManager from '../intl.js';

function CustomIntlProvider({ locale, messages, children }) {
  return (
    <div className="intl-wrapper" data-locale={locale}>
      <IntlProvider locale={locale} messages={messages}>
        {children}
      </IntlProvider>
    </div>
  );
}

const CustomIntlMessagesProvider = withMessagesProvider(intlManager)(CustomIntlProvider);

export default function App({ children }) {
  return (
    <CustomIntlMessagesProvider locale="fr-FR">
      {children}
    </CustomIntlMessagesProvider>
  );
}
```

## useMessages

Hook to get all currently loaded messages.

```javascript
import { useMessages } from '@gasket/react-intl';

export default function MyComponent() {
  const messages = useMessages();

  return (
    <div>
      <p>{messages.welcome}</p>
      <p>{messages.description}</p>
      <p>Available messages: {Object.keys(messages).join(', ')}</p>
    </div>
  );
}
```

### With Message Validation

```javascript
import { useMessages } from '@gasket/react-intl';

export default function SafeComponent() {
  const messages = useMessages();

  // Safely access messages with fallbacks
  const welcomeMessage = messages.welcome || 'Welcome';
  const hasErrorMessages = 'error' in messages;

  return (
    <div>
      <h1>{welcomeMessage}</h1>
      {hasErrorMessages && (
        <div className="error">
          {messages.error}
        </div>
      )}
    </div>
  );
}
```

## useLocaleFile

Hook to load locale files and get their loading status.

### Single Locale File

```javascript
import { useLocaleFile, LocaleFileStatus } from '@gasket/react-intl';

export default function ProductPage() {
  const status = useLocaleFile('/locales/products');

  if (status === LocaleFileStatus.loading) {
    return <div>Loading product translations...</div>;
  }

  if (status === LocaleFileStatus.error) {
    return <div>Failed to load translations</div>;
  }

  if (status === LocaleFileStatus.loaded) {
    return <div>Product page content...</div>;
  }

  return null;
}
```

### Multiple Locale Files

```javascript
import { useLocaleFile, LocaleFileStatus } from '@gasket/react-intl';

export default function CheckoutPage() {
  const status = useLocaleFile('/locales/checkout', '/locales/payment', '/locales/shipping');

  // Returns the "lowest" status (least loaded state)
  switch (status) {
    case LocaleFileStatus.loading:
      return <div>Loading checkout translations...</div>;
    case LocaleFileStatus.error:
      return <div>Translation error occurred</div>;
    case LocaleFileStatus.loaded:
      return <div>Checkout form...</div>;
    default:
      return <div>Initializing...</div>;
  }
}
```

## LocaleFileRequired

Component that conditionally renders children based on locale file loading status.

### Basic Usage

```javascript
import { LocaleFileRequired } from '@gasket/react-intl';
import { FormattedMessage } from 'react-intl';

export default function ProductsPage() {
  return (
    <div>
      <h1>Products</h1>
      <LocaleFileRequired localeFilePath="/locales/products">
        <div>
          <FormattedMessage id="products.title" />
          <FormattedMessage id="products.description" />
        </div>
      </LocaleFileRequired>
    </div>
  );
}
```

### With Custom Loading Component

```javascript
import { LocaleFileRequired } from '@gasket/react-intl';
import Spinner from '../components/Spinner';

export default function UserProfile() {
  return (
    <LocaleFileRequired
      localeFilePath="/locales/profile"
      loading={<Spinner text="Loading profile translations..." />}
    >
      <div>
        <h1><FormattedMessage id="profile.title" /></h1>
        <p><FormattedMessage id="profile.bio" /></p>
      </div>
    </LocaleFileRequired>
  );
}
```

### Multiple Locale Files

```javascript
import { LocaleFileRequired } from '@gasket/react-intl';

export default function ComplexPage() {
  return (
    <LocaleFileRequired
      localeFilePath={['/locales/common', '/locales/forms', '/locales/validation']}
      loading={<div className="loading">Loading translations...</div>}
    >
      <form>
        <FormattedMessage id="form.title" />
        <input placeholder={intl.formatMessage({ id: 'form.username' })} />
        <FormattedMessage id="validation.required" />
      </form>
    </LocaleFileRequired>
  );
}
```

### Nested Locale Requirements

```javascript
import { LocaleFileRequired } from '@gasket/react-intl';

export default function NestedPage() {
  return (
    <LocaleFileRequired localeFilePath="/locales/common">
      <div>
        <h1><FormattedMessage id="common.title" /></h1>

        <LocaleFileRequired localeFilePath="/locales/widgets">
          <Widget />
        </LocaleFileRequired>

        <LocaleFileRequired
          localeFilePath="/locales/footer"
          loading={<div>Loading footer...</div>}
        >
          <Footer />
        </LocaleFileRequired>
      </div>
    </LocaleFileRequired>
  );
}
```

## withLocaleFileRequired

HOC that wraps a component with locale file loading requirements.

### Basic Usage

```javascript
import { withLocaleFileRequired } from '@gasket/react-intl';
import { FormattedMessage } from 'react-intl';

function ContactForm() {
  return (
    <form>
      <h1><FormattedMessage id="contact.title" /></h1>
      <input placeholder="Name" />
      <textarea placeholder="Message" />
      <button><FormattedMessage id="contact.submit" /></button>
    </form>
  );
}

export default withLocaleFileRequired('/locales/contact')(ContactForm);
```

### With Loading Component

```javascript
import { withLocaleFileRequired } from '@gasket/react-intl';
import LoadingSpinner from '../components/LoadingSpinner';

function ShoppingCart() {
  return (
    <div>
      <h1><FormattedMessage id="cart.title" /></h1>
      <div><FormattedMessage id="cart.empty" /></div>
    </div>
  );
}

export default withLocaleFileRequired('/locales/cart', {
  loading: <LoadingSpinner message="Loading cart translations..." />
})(ShoppingCart);
```

### Multiple Locale Files

```javascript
import { withLocaleFileRequired } from '@gasket/react-intl';

function Dashboard() {
  return (
    <div>
      <h1><FormattedMessage id="dashboard.title" /></h1>
      <div><FormattedMessage id="analytics.summary" /></div>
      <div><FormattedMessage id="reports.recent" /></div>
    </div>
  );
}

export default withLocaleFileRequired([
  '/locales/dashboard',
  '/locales/analytics',
  '/locales/reports'
], {
  loading: <div>Loading dashboard...</div>
})(Dashboard);
```

### With Forward Ref

```javascript
import { withLocaleFileRequired } from '@gasket/react-intl';
import { forwardRef } from 'react';

const CustomInput = forwardRef(function CustomInput(props, ref) {
  return (
    <input
      ref={ref}
      placeholder={props.placeholder}
      {...props}
    />
  );
});

const LocalizedInput = withLocaleFileRequired('/locales/forms', {
  forwardRef: true
})(CustomInput);

// Usage with ref
function ParentComponent() {
  const inputRef = useRef();

  return (
    <LocalizedInput
      ref={inputRef}
      placeholder="Enter text..."
      onFocus={() => inputRef.current.select()}
    />
  );
}
```

### Advanced Status Checking

```javascript
import { needsToLoad, LocaleFileStatus } from '@gasket/react-intl';

function SmartLocaleStatus({ paths }) {
  const statuses = paths.map(path => ({
    path,
    status: useLocaleFile(path),
  }));

  const needsLoading = statuses.filter(({ status }) => needsToLoad(status));
  const loading = statuses.filter(({ status }) => status === LocaleFileStatus.loading);
  const loaded = statuses.filter(({ status }) => status === LocaleFileStatus.loaded);
  const errors = statuses.filter(({ status }) => status === LocaleFileStatus.error);

  return (
    <div>
      <div>Ready to load: {needsLoading.length}</div>
      <div>Currently loading: {loading.length}</div>
      <div>Successfully loaded: {loaded.length}</div>
      <div>Failed to load: {errors.length}</div>
    </div>
  );
}
```
