# Gasket Tech Stack

Gasket brings together a variety of technologies to guide you in creating a web
application.

![Your node_modules](../images/node_modules.jpeg)

But what are these technologies, and how do they tie together? This guide will
explain.

## Runtime Stack

Gasket provides an HTTP/HTTPS application server that has server-side rendering, and
more. It also provides a collection of components which you can use in your application
code. Here's what's included.

### Node.js

Gasket is built on top of [Node.js], a standalone JavaScript engine. Having your
application built entirely in JavaScript on both the front-end and back-end is
what enables the universal rendering capabilities supplied by Gasket.

### Express

Inbound HTTP requests are handled by [Express], a very popular and minimalist
framework for building HTTP servers. Gasket implements many of its features
through Express middleware, and it [provides hooks][Express Plugin] for developers
to inject their own middleware.

### Winston

Gasket apps are provided a logger implemented through the highly customizable
[winston] library.

### Next.js

[Next.js] is a single-page-app (SPA) framework with server-side rendering (SSR),
hot module reloading, and code splitting capabilities. Gasket integrates these
capabilities into the overall framework.

### React

[React] is a component-based JavaScript framework for building user interfaces.
These components are used for both SSR and dynamic client-side HTML. All of your
application's web pages will be built using React components.

### Redux

[Redux] is a state management container following the [Flux] architectural
pattern. A redux store is included in every Gasket application to support
built-in Gasket functionality, and Gasket enables you to
[extend this store][Redux Components] for your application's usage. The
following middlewares/enhancers are pre-included in the store:

#### Redux Thunk

[Redux Thunk] provides a straightforward Promise-based solution for asynchronous
action dispatching.

#### redux-dynamic-reducer

The [redux-dynamic-reducer] library is what enables gasket applications to
include reducers in code splitting chunks, enabling custom reducers per page.

#### redux-logger

The [redux-logger] module enables logging/replaying of redux activity.

#### Redux DevTools Extension

[Redux DevTools Extension] isn't something that's installed in the redux store,
specifically, but the Gasket store is configured so that it will integrate
with this extension when installed in your browser.

### React Intl

[React Intl] is a set of React components to aid in building localized content.
Gasket wraps this library with its own
[@gasket/intl components][Intl Components] that supports modularized localized
text files that can be downloaded at runtime or provided during a SSR.


## Build Technologies

The Gasket toolkit includes a convenient `gasket build` command to compile your
source code into browser-deliverable assets. This build command is built on the
following technologies:

### webpack

The [webpack] bundler crawls your source code, spitting out assets as it goes.
Its behavior is hugely dependent on a set of rules, loaders, plugins, and other
configuration. Thankfully, Gasket compiles a webpack configuration compatible
with Next.js [for you][Core Plugin], while allowing you to merge in
your own customizations.

### Babel

In order to support modern JS features in not-so-modern browsers, and to give
you that nice JSX syntax so common in React development, Gasket provides [Babel]
support through a webpack loader. The babel configuration file that is
auto-generated comes pre-loaded with a nice preset of plugins from Next.js.

### Sass

[Sass], a.k.a. SCSS, is a superset of CSS that makes managing your stylesheets
much easier. `.scss` files you
import into your JS modules will be automatically transpiled/bundled into CSS
files through webpack loaders.

## Quality Tools

Gasket also integrates with a variety of tools to aid developers in producing
quality source code.

### Linting & Style Enforcement

Linting is an inspection of your code for common problems that can lead to bugs
or code maintainability issues. Style enforcement ensures that naming in &
formatting of source code follows standardized conventions. Linting & style
enforcement are provided by the following tools:

#### ESLint

[ESLint] provides JavaScript & JSON linting and style enforcement rules. GoDaddy
has its own [company style standards][godaddy-style], which Gasket uses in its
auto-generated configuration.

#### stylelint

The [stylelint] utility does linting and style enforcement for Sass and CSS
files.

### Testing Platforms

A testing platform is comprised of various pieces. There are many choices of
technologies in the JavaScript community for testing and many opinions, so as a
result Gasket does not provide a standard set of testing tools. It does,
however, provide two plugins options for two different philosophies.

#### @gasket/plugin-mocha

Use the [Mocha Plugin] if you don't like the Jest "monolith" and prefer an
assemblage of single-purpose tools. Although "Mocha" is in the name, this plugin
is really a collection of various tools:

- [Mocha] - Test runner + library for structuring TDD/BDD-style tests
- [Chai] - TDD/BDD-style assertion library
- [Sinon.JS] - Mocking/stubbing/spying library
- [Istanbul] - Code coverage instrumentation & reporting
- [jsdom] - JavaScript DOM implementation to support DOM-based tests in node
- [Enzyme] - Utilities for testing React components
- Miscellaneous plugins to tie everything together

To install all this test boilerplate, add a `--plugins=@gasket/mocha` command-line
option in your `gasket create` call.

#### @gasket/plugin-jest

[Jest] is a batteries-included test framework with developer ease in mind. The
[Jest Plugin] auto-generates some sample test boilerplate to help get you
started, and it also includes [Enzyme]. Specify this plugin when running
`gasket create` via a `--plugins=@gasket/jest` command-line option.

[Babel]: https://babeljs.io/
[Chai]: http://www.chaijs.com/
[Express Plugin]: /packages/gasket-plugin-express
[Enzyme]: http://airbnb.io/enzyme/
[ESLint]: https://eslint.org/
[Express]: http://expressjs.com/
[Flux]: https://facebook.github.io/flux/docs/overview.html
[godaddy-style]: https://github.com/godaddy/javascript
[Intl Components]: /packages/intl
[Intl Plugin]: /packages/gasket-plugin-intl
[Istanbul]: https://github.com/istanbuljs/nyc
[Jest]: https://jestjs.io/
[Jest Plugin]: /packages/gasket-jest-plugin
[jsdom]: https://github.com/jsdom/jsdom
[Mocha]: https://mochajs.org/
[Mocha Plugin]: /packages/gasket-mocha-plugin
[Next.js]: https://nextjs.org/
[Node.js]: https://nodejs.org/en/
[React]: https://reactjs.org/
[React Intl]: https://github.com/yahoo/react-intl
[Redux]: https://redux.js.org/
[Redux Components]: /packages/gasket-redux
[Redux DevTools Extension]: https://github.com/zalmoxisus/redux-devtools-extension
[redux-dynamic-reducer]: https://github.com/ioof-holdings/redux-dynamic-reducer
[redux-logger]: https://github.com/evgenyrodionov/redux-logger
[Redux Thunk]: https://github.com/reduxjs/redux-thunk
[Sass]: https://sass-lang.com/
[Sinon.JS]: https://sinonjs.org/
[stylelint]: https://github.com/stylelint/stylelint
[webpack]: https://webpack.js.org/
[winston]: https://github.com/winstonjs/winston
