const middleware = require('./middleware');
const { Resource } = require('@opentelemetry/resources');
const {
  SEMRESATTRS_SERVICE_NAME
} = require('@opentelemetry/semantic-conventions');

module.exports = {
  name: '@gasket/plugin-otel',
  hooks: {
    /**
     * Apply configuration changes prior to local/start events.
     *
     * @param {Gasket} gasket - Gasket
     * @param {object} config - Configuration to augment
     * @returns {object} config
     */
    configure(gasket, config) {
      return {
        ...config,
        traceConfig: {
          resource: new Resource({
            [SEMRESATTRS_SERVICE_NAME]: 'gasket-traceid-middleware'
          })
        }
      };
    },
    start() {
      console.log('Starting up OpenTelemetry Plugin!!!');
    },
    preboot() {
      console.log('Preboot OpenTelemetry Plugin!!!');
      require('./instrumentation');
    },
    middleware,
  }
}
