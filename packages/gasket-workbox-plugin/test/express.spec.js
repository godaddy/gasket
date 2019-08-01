const express = require('../lib/express');
const utils = require('../lib/utils');
const serveStatic = require('serve-static');

describe('express', () => {
  let mockGasket, mockApp;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: '/some-root',
        workbox: utils.defaultConfig
      }
    };
    mockApp = {
      use: jest.fn()
    };
  });

  it('sets up endpoint', () => {
    express(mockGasket, mockApp);
    expect(mockApp.use).toHaveBeenCalledWith('/_workbox', expect.any(Function));
  });

  it('sets up endpoint to with serve static', () => {
    express(mockGasket, mockApp);
    const expectedOutput = utils.getOutputDir(mockGasket);
    expect(serveStatic).toHaveBeenCalledWith(
      expectedOutput,
      expect.objectContaining({
        index: false,
        maxAge: '1y',
        immutable: true
      }));
  });
});
