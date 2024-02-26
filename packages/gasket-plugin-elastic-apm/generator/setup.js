/* eslint-disable no-process-env */
require('dotenv').config();

// Elastic APM setup
require('elastic-apm-node').start({
  serviceName: 'my-service-name',
  captureHeaders: false,
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
  serverUrl: process.env.ELASTIC_APM_SERVER_URL
});
