/* eslint-disable no-console, no-process-env, no-process-exit */
import 'dotenv/config';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
// import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
// import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT
} from '@opentelemetry/semantic-conventions';

// Debug logging
if (process.env.GASKET_OTEL_DEBUG) {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
}

// Ensure required environment variables are set
if (
  !process.env.OTEL_SERVICE_NAME ||
  !process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
  !process.env.OTEL_EXPORTER_OTLP_HEADERS
) {
  throw new Error('Missing required OTel environment variables');
}

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: process.OTEL_SERVICE_NAME,
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.GASKET_ENV || process.NODE_ENV || 'production'
  }),
  // Metrics are currently not readable in ESS
  // https://www.elastic.co/guide/en/observability/current/apm-open-telemetry-known-limitations.html#apm-open-telemetry-metrics-limitations
  // metricReader: new PeriodicExportingMetricReader({
  //   exporter: new OTLPMetricExporter(),
  //   exportIntervalMillis: 1000, // interval tbd
  // }),
  logRecordProcessor: new SimpleLogRecordProcessor(new OTLPLogExporter()),
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-fs': { enabled: false }
  })]
});

sdk.start();

console.log('Instrumentation started');

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => {
      console.log('Tracing terminated');
    })
    .catch((error) => {
      console.log('Error terminating tracing', error);
    })
    .finally(() => process.exit(0));
});

