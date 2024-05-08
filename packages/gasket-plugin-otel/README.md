# @gasket/plugin-otel

Gasket plugin for OpenTelemetry support.

## Installation

#### Existing apps

```shell
npm i @gasket/plugin-otel
```

Add the [instrumentation](./generator/instrumentation.js) file to the root of your application.

Configure OTel environment variables in your `.env` file:

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=<your-ess-otel-endpoint>
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer <ess-secret>"
OTEL_SERVICE_NAME=<service-name>
```

Update `npm` scripts in your `package.json`:

```diff
{
  "scripts": {
-    "start": "node server.js",
+    "start": "node --import ./instrumentation.js server.js"
  }
}
```
