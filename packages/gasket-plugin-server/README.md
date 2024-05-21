# @gasket/plugin-server

A helper plugin to handle common server engine setups for routing and
executing lifecycles. 


## Configuration

All the configurations for a server setup are added under `express` or `fastify` in the config:

- `compression`: true by default. Can be set to false if applying compression
  differently.
- `excludedRoutesRegex`: (deprecated) renamed to more correct `middlewareInclusionRegex`.
- `middlewareInclusionRegex`: RegExp filter to apply toward request URLs to determine when Gasket middleware will run. You can use negative lookahead patterns to exclude routes like static resource paths.
- `routes`: [Glob pattern](https://github.com/isaacs/node-glob#glob-primer) for source files exporting route-defining functions. These functions will be passed the express `app` object, and therein they can attach handlers and middleware.
- `trustProxy`: Enable trust proxy option, [Fastify trust proxy documentation](https://fastify.dev/docs/latest/Reference/Server/#trustproxy) or [Express trust proxy documentation](https://expressjs.com/en/guide/behind-proxies.html)

| Key            | Description | Default | Fastify | Express |
| -------------- | ----------- | ------- | ------- | ------- |
| `compression ` | | true |||
| `excludedRoutesRegex` | (deprecated) renamed to more correct middlewareInclusionRegex. | | |
| `middlewareInclusionRegex` | RegExp filter to apply toward request URLs to determine when Gasket middleware will run. You can use negative lookahead patterns to exclude routes like static resource paths. | |||
| `routes` | Route-defining functions - these functions will be passed the `app` object, and therein they can attach handlers and middleware.



