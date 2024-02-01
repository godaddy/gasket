require('dotenv').config();

// Elastic APM setup
require('elastic-apm-node').start({
  serviceName: '<YOUR_APP_NAME_HERE>',
  // Avoid sensitive data from being sent
  // @see https://www.elastic.co/guide/en/apm/agent/nodejs/4.x/configuration.html#capture-headers
  captureHeaders: false
});
