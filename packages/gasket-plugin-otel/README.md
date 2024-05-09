# @gasket/plugin-otel

Gasket plugin for OpenTelemetry support. The instrumentation file supports automatic instrumentation for Node.js applications. For more information, see the OTel [Automatic Instrumentation][automatic-instrumentation] documentation. To fine tune traces a manual instrumentation is required.

## Installation

#### Existing apps

```shell
npm i @gasket/plugin-otel
```

Copy the [instrumentation](./generator/instrumentation.js) file content to a new file root of your application.

Configure OTel environment variables in your `.env` file:

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=<your-ess-otel-endpoint>
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer <ess-secret>"
OTEL_SERVICE_NAME=<service-name>

# Optional
OTEL_SERVICE_VERSION=<service-version>
OTEL_NODE_ENABLED_INSTRUMENTATIONS=<instrumentations>
OTEL_NODE_RESOURCE_DETECTORS=<resource-detectors>
```

Update start script in your `package.json`:

```diff
{
  "scripts": {
-    "start": "node server.js",
+    "start": "node --import ./instrumentation.js server.js"
  }
}
```

## Documentation

- [Automatic Instrumentation Configuration](https://opentelemetry.io/docs/languages/js/automatic/configuration/)
- [SDK Configuration](https://opentelemetry.io/docs/languages/sdk-configuration/)
- [OTLP Exporter Configuration](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/)
- [Express Manual Instrumentation](https://www.npmjs.com/package/@opentelemetry/instrumentation-express)
- [Http Manual Instrumention](https://www.npmjs.com/package/@opentelemetry/instrumentation-http)
- [Fastify Manual Instrumentation](https://www.npmjs.com/package/@opentelemetry/instrumentation-fastify)

<!-- Links -->
[automatic-instrumentation]:https://opentelemetry.io/docs/languages/js/automatic/
