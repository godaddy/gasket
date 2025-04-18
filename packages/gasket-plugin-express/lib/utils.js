let instance = null;

/**
 * Get the Express instance.
 * @param {import('@gasket/core').Gasket} gasket - Gasket instance
 * @returns {import('express').Express} - Express instance
 */
function getAppInstance(gasket) {
  if (!instance) {
    const express = require('express');
    const { http2 } = gasket.config;
    instance = http2 ? require('http2-express')(express) : express();
    instance.use(require('cookie-parser')());
  }

  return instance;
}

module.exports = {
  getAppInstance,
  testClearAppInstance: () => {
    instance = null;
  }
};
