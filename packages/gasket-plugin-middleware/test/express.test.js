const app = {
  use: jest.fn(),
  post: jest.fn(),
  set: jest.fn()
};
const cookieParserMiddleware = jest.fn();
const mockCookieParser = jest.fn().mockReturnValue(cookieParserMiddleware);

jest.mock('cookie-parser', () => mockCookieParser);

const express = require('../lib/express');

describe('Express', () => {
  let gasket, lifecycles, mockMwPlugins;
  const sandbox = jest.fn();

  beforeEach(() => {
    mockMwPlugins = [];

    lifecycles = {
      errorMiddleware: jest.fn().mockResolvedValue([]),
      express: jest.fn().mockResolvedValue()
    };

    gasket = {
      middleware: {},
      logger: {
        warn: jest.fn()
      },
      config: {},
      exec: jest
        .fn()
        .mockImplementation((lifecycle, ...args) =>
          lifecycles[lifecycle](args)
        ),
      execApply: sandbox.mockImplementation(async function (lifecycle, fn) {
        for (let i = 0; i < mockMwPlugins.length; i++) {
          // eslint-disable-next-line  no-loop-func
          fn(mockMwPlugins[i], () => mockMwPlugins[i]);
        }
        return jest.fn();
      })
    };

    jest.clearAllMocks();
  });

  it('does not enable trust proxy by default', async () => {
    await express(gasket, app);
    expect(app.set).not.toHaveBeenCalled();
  });

  it('does enable trust proxy by if set to true', async () => {
    gasket.config.express = { trustProxy: true };
    await express(gasket, app);

    expect(app.set).toHaveBeenCalledWith('trust proxy', true);
  });

  it('does enable trust proxy by if set to string', async () => {
    gasket.config.express = { trustProxy: '127.0.0.1' };
    await express(gasket, app);

    expect(app.set).toHaveBeenCalledWith('trust proxy', '127.0.0.1');
  });

  it('setups up patch middleware for http2', async () => {
    gasket.config.http2 = 8080;
    await express(gasket, app);

    // Added as the first middleware
    const patchMiddleware = app.use.mock.calls[0][0];
    expect(patchMiddleware).toHaveProperty('name', 'http2Patch');

    // attaches _implicitHeader to the response object
    const req = {};
    const res = {};
    const next = jest.fn();
    patchMiddleware(req, res, next);

    expect(res).toHaveProperty('_implicitHeader');
    expect(next).toHaveBeenCalled();
  });

  it('attaches a logger to the request', async () => {
    const augmentedLogger = { info: jest.fn() };
    gasket.logger = { child: jest.fn().mockReturnValue(augmentedLogger) };
    await express(gasket, app);

    const req = {};
    const res = {};
    const next = jest.fn();

    app.use.mock.calls.forEach(([middleware]) => middleware(req, res, next));
    expect(req).toHaveProperty('logger', gasket.logger);

    req.logger.metadata({ userId: '123' });
    expect(gasket.logger.child).toHaveBeenCalledWith({ userId: '123' });

    req.logger.info('test');
    expect(augmentedLogger.info).toHaveBeenCalledWith('test');
  });
});
