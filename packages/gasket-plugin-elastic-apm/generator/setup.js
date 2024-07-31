/* eslint-disable no-process-env */
import dotenv from 'dotenv';
import apm from 'elastic-apm-node';

dotenv.config();

// Elastic APM setup
apm.start({
  serviceName: 'my-service-name',
  captureHeaders: false,
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
  serverUrl: process.env.ELASTIC_APM_SERVER_URL
});
