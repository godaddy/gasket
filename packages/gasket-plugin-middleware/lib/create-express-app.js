const express = require('express');

module.exports = function createExpressApp({ http2 }) {
  const expressApp = http2 ? require('http2-express-bridge')(express) : express();
  return expressApp;
};
