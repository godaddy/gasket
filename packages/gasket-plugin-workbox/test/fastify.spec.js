const fastify = require('../lib/fastify');
const utils = require('../lib/utils');
const serveStatic = require('serve-static');

describe('fastify', () => {
  let mockGasket, mockApp;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: 'some-root',
        workbox: utils.defaultConfig
      }
    };
    mockApp = {
      register: jest.fn()
    };
  });

  it('sets up endpoint', () => {
    fastify(mockGasket, mockApp);
    expect(mockApp.register).toHaveBeenCalledWith(expect.any(Function), { prefix: '/_workbox' });
  });

  it('sets up endpoint to with serve static', () => {
    fastify(mockGasket, mockApp);
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
