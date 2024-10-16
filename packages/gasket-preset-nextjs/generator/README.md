# {{{appName}}}

{{{appDescription}}}

## Overview

This application is built with [Gasket] and [Next.js] utilizing [EcmaScript Modules] and requires Node.js v20 or higher.

## Getting Started

### Development

To start the app locally, run:

```bash
cd {{{appName}}}
{{{installCmd}}}
{{{localCmd}}}
```

### Debugging

To start the API locally with debugging enabled, run:

```bash
DEBUG=* {{{localCmd}}}
```

Extended filtering of the debug output can be achieved by adding to the `DEBUG` environment variable:

```bash
DEBUG=gasket:* {{{localCmd}}} // gasket operations only
DEBUG={{{server}}}:* {{{localCmd}}} // {{{server}}} operations only
```

{{#each readme.markdown}}
{{{markdownCompile this}}}
{{/each}}
<!-- LINKS -->
[Gasket]: https://gasket.dev
[Next.js]: https://nextjs.org
[EcmaScript Modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
{{#each readme.links}}
{{{this}}}
{{/each}}
