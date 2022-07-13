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
    expect(mockApp.register).toHaveBeenCalledWith('/_workbox');
  })
});
