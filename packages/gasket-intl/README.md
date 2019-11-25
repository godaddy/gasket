# @gasket/intl

React component library to enable localization for Gasket apps.

## Installation

```
npm i @gasket/intl
```

## Components

- `withLocaleRequired(identifier, otherProps)(component)` - Higher-order
  component to wrap pages or components.

- `<LocaleRequired>` - Loads messages from locale files.

## Types

**Identifier**

This tell the components what locale files of which modules to load.

An identifier is made up of 2 parts:
- `module`: this is the name of a node module or package name. If it is left
  blank or set to `default`, it will be defaulted to the main app's package
  name.
- `namespace`: this is the name of a file within that module's locale directory.
  If it is left blank, the component will not try to load a namespace file.

The parts can be described in the following shapes:
- string: `<module>.<namespace>`
- string[]: array of strings in the form `<module>.<namespace>`
- object: `{module, namespace}`
- object[]: array of objects with the form `{module, namespace}`

## Component Props

- `identifier`: (Identifier) What locale file(s) to load.
- `loading`: (string|node) Optional content to render while loading. Defaults to
  null. When using the HOC at the page-level, `getInitialProps` will be invoked
  and defer rendering until locale content is loaded.

## HOC Arguments

- `identifier`: (Identifier) What locale file(s) to load.
- `otherProps`: (Object) Besides identifier, other props supported by the
  component.

## Selectors

### selectMessage

`selectMessage(state, id, [defaultMessage])`

For use outside of `react-intl` provider context.

- `state`: (object) redux state
- `id`: (string) message id or key
- `defaultMessage`: (string) Optional message if `id` is not found. Otherwise
  the name of the id will be returned.

### selectAllMessages

`selectAllMessages(state)`

Used by IntlProvider internally, but exposed for some edge use cases.

## Usage

### LocaleRequired

This component loads localization messages for the associated package as
described by the identifier.

#### Example : When keys are defined in the `locales` root.

In the below example, `app_more_info` and `app_details` are two keys defined in
the locale file for our app. If `identifier` prop is not set, it will default to
the locale file of the app.

```js
import { LocaleRequired } from '@gasket/intl';

<LocaleRequired>
  <div>
    <div><FormattedMessage id='app_more_info' /></div>
    <div><FormattedMessage id='app_details' /></div>
  </div>
</LocaleRequired>
```

#### Example : When keys are defined under a namespace folder.

The prop `identifier` could be `.namespace` or `{ namespace: 'namespace' }`

```js
<LocaleRequired identifier={{ namespace: 'namespace' }}>
  ...
</LocaleRequired>
```

#### Example : When keys are defined under a package's `locale` root.

The prop `identifier` could be `@myscope/some-module` or `{ module:
'@myscope/some-module' }`

```js
<LocaleRequired identifier='@myscope/some-module'>
  ...
</LocaleRequired>
```

#### Example : When keys are defined under a namespace folder for a package.

The prop `identifier` could be `@myscope/some-module.namespace` or `{ module:
'@myscope/some-module', namespace: 'namespace' }`

```js
<LocaleRequired identifier={{ module: '@myscope/some-module', namespace: 'namespace' }}>
  ...
</LocaleRequired>
```


**Note:** Only one level of namespacing is allowed. So if you use
`app-name.name.space`, the `module` will be `"app-name"` with the `namespace`
becoming `"name.space"`.


#### Example : When keys are defined in multiple spaces

```js
<LocaleRequired identifier={['app-name', '@myscope/some-module.namespace']}>
  ...
</LocaleRequired>

```

### withLocaleRequired

This is a higher order component that wraps components with LocaleRequired.

```js
import { withLocaleRequired } from '@gasket/intl';

class TargetComponent extends React.Component {
  render() {
    return ...;
  }
}

export default withLocaleRequired(<identifier>)(TargetComponent);
```

#### Examples

Here are some example uses of the HOC, setting arguments and identifiers in a
variety of supported formats.

```jsx
// Defaults the module to the app's package name
withLocaleRequired()
withLocaleRequired('')
withLocaleRequired('default')
withLocaleRequired('.some-namespace')

// Loads locale files of a node module
withLocaleRequired('a-package')
withLocaleRequired('a-package.some-namespace')

// Loads multiple locale files
withLocaleRequired(['a-package.some-namespace', 'b-package.other-namespace'])

// Uses the default module (app's package name), and sets loading indicator
withLocaleRequired(null, { loading: <Spinner/> })

// Uses locale files of a node module, and sets loading indicator
withLocaleRequired({ module: 'a-package' }, { loading: <Spinner/> })

// Uses the default module, but with specified namespace
withLocaleRequired({ namespace: 'some-namespace' })

// Loads a namespace file for a node module and sets loading indicator
withLocaleRequired({ module: 'a-package', namespace: 'some-namespace'}, { loading: <Spinner/> })
```

#### Example shallow rendering with Enzyme When Using `withLocaleRequired`

If you want to test with `shallow(<ComponentName />)` on a react component which
uses `withLocaleRequired`, you will need to make two exports in your component
file, a named and a default export.

```js
export class ExampleComponent extends Component {
    ...
}

export default withLocaleRequired('identifier')(ExampleComponent);
```

To use the component in another component, use the default import,

```js
import ExampleComponent from '../components/examplecomponent';
```

but to test with `shallow(<ComponentName />)`, use the named import.

```js
import { ExampleComponent } from '../../components/examplecomponent';
```

### withIntlProvider

This component reads the locale manifest and attaches all the available messages
data with IntlProvider. It will be added to GasketApp by default.

```js
import App from 'next/app';
import withRedux from 'next-redux-wrapper';
import makeStore from './redux-store';
import { withIntlProvider } from '@gasket/intl';

export default withRedux(makeStore)(withIntlProvider()(App));
```

### Selectors

This example demonstrates how to inject locale messages into a component when
not using `react-intl`:

```js
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { withLocaleRequired, selectMessage } from '@gasket/intl';

const MyComponent = ({ someTitle, someContent }) => (
  <Fragment>
    <h1>{someTitle}</h1>
    <p>{someContent}</p>
  </Fragment>
);

const mapStateToProps = state => ({
  someTitle: selectMessage(state, 'someTitle'),
  someContent: selectMessage(state, 'someContent', 'The is placeholder test')
});

export default connect(mapStateToProps)(
  withLocaleRequired()(MyComponent);
```

This example demonstrations how to select a locale message for use in an action
creator:

```js
import { selectMessage } from '@gasket/intl';
import { addGrowlMessage } from '@ux/growl';

const performSomeAction = (payload) => {
  return (dispatch, getState) => {
    // do something, then:
    addGrowlMessage({
      title: selectMessage(getState(), 'success-title'),
      content: selectMessage(getState(), 'success-content', 'Great job!')
    })
  }
}
```
