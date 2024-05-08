const dotenv = require('dotenv').config();


const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();










// const { BUILD_INFO } = require('./build-info');
// const { DiagConsoleLogger, DiagLogLevel, diag } = require('@opentelemetry/api');
// const { NodeSDK } = require('@opentelemetry/sdk-node');
// const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
// const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
// const { Resource } = require('@opentelemetry/resources');
// const {
//   SEMRESATTRS_SERVICE_NAME,
//   SEMRESATTRS_SERVICE_VERSION,
//   SEMRESATTRS_DEPLOYMENT_ENVIRONMENT
// } = require('@opentelemetry/semantic-conventions');
// const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
// const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc');
// const { SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');
// const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-grpc');
// const { WinstonInstrumentation } = require('@opentelemetry/instrumentation-winston');

// // diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// const logRecordProcessor = new SimpleLogRecordProcessor(new OTLPLogExporter());

// const sdk = new NodeSDK({
//   resource: new Resource({
//     [SEMRESATTRS_SERVICE_NAME]: BUILD_INFO.service,
//     [SEMRESATTRS_SERVICE_VERSION]: BUILD_INFO.version,
//     [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: BUILD_INFO.environment
//   }),
//   metricReader: new PeriodicExportingMetricReader({
//     exporter: new OTLPMetricExporter()
//   }),
//   traceExporter: new OTLPTraceExporter(),
//   logRecordProcessor,
//   instrumentations: [
//     getNodeAutoInstrumentations({
//       // '@opentelemetry/middleware': { enabled: false } // disable if this is too noisy for you
//       '@opentelemetry/instrumentation-fs': { enabled: false }
//     }),
//     new WinstonInstrumentation()
//   ]
// });

// sdk.start();

// console.log(
//   `Instrumentation started for ${BUILD_INFO.service} version ${BUILD_INFO.version}`
// );

// process.on('SIGTERM', () => {
//   sdk
//     .shutdown()
//     .then(() => {
//       console.log('Tracing terminated');
//     })
//     .catch((error) => {
//       console.log('Error terminating tracing', error);
//     })
//     .finally(() => process.exit(0));
// });
