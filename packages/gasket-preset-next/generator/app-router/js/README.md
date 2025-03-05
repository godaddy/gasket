# app-router

Gasket App

## Overview

This application is built with [Gasket] and [Next.js] utilizing [EcmaScript Modules] and requires Node.js v20 or higher.

## Getting Started

### Development

To start the app locally, run:

```bash
cd app-router
npm install
npm run local
```

### Debugging

To start the API locally with debugging enabled, run:

```bash
DEBUG=* npm run local
```

Extended filtering of the debug output can be achieved by adding to the `DEBUG` environment variable:

```bash
DEBUG=gasket:* npm run local // gasket operations only
DEBUG=:* npm run local //  operations only
```

### Documentation

Generated docs will be placed in the `.docs` directory. To generate markdown documentation for the API, run:

```bash
npm run docs
```

### Docusaurus

When using [Docusaurus], generated docs will be available at `http://localhost:3000` when running the [Docusaurus] server. By default the Docusaurus server is started with the `docs` script. Add the `--no-view` option to only generate the markdown files.

### App Router

This Gasket app uses Next.js 14 with [App Router] which allows for intuitive, file-based routing within the app directory. The integration with Next.js 14 enhances development by leveraging features like automatic static optimization and server-side rendering, ensuring a scalable and efficient web application.




<!-- LINKS -->
[Gasket]: https://gasket.dev
[Next.js]: https://nextjs.org
[EcmaScript Modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
[Docusaurus]: https://docusaurus.io/
[App Router]: https://nextjs.org/docs/app
