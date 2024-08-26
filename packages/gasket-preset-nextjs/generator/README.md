# {{{appName}}}

{{{appDescription}}}

## Overview

This application is built with [Gasket](https://gasket.dev/) and [Next.js](https://nextjs.org/). This application utilizes [EcmaScript Modules] and requires Node.js v20 or higher.

## Getting Started

### Development

To start the app locally, run:

```bash
cd {{{appName}}}
{{{installCmd}}}
{{{packageManager}}} run local
```

### Debugging

To start the API locally with debugging enabled, run:

```bash
DEBUG=* {{{packageManager}}} run local
```

Extended filtering of the debug output can be achieved by adding to the `DEBUG` environment variable:

```bash
DEBUG=gasket:* {{{packageManager}}} run local // gasket operations only
DEBUG={{{server}}}:* {{{packageManager}}} run local // {{{server}}} operations only
```

{{#each readme.markdown}}
{{{markdownCompile this}}}
{{/each}}
<!-- LINKS -->
[App Router]: https://nextjs.org/docs/app
[Page Router]: https://nextjs.org/docs/pages
[Custom Server]: https://nextjs.org/docs/pages/building-your-application/configuring/custom-server
[EcmaScript Modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
{{#each readme.links}}
{{{this}}}
{{/each}}
