const middie = require('@fastify/express');

const app = {
  ready: jest.fn(),
  server: {
    emit: jest.fn()
  },
  register: jest.fn(),
  use: jest.fn(),
  addHook: jest.fn()
};

const mockFastify = jest.fn().mockReturnValue(app);
const cookieParserMiddleware = jest.fn();
const compressionMiddleware = jest.fn();
const mockCookieParser = jest.fn().mockReturnValue(cookieParserMiddleware);
const mockCompression = jest.fn().mockReturnValue(compressionMiddleware);


jest.mock('fastify', () => mockFastify);
jest.mock('cookie-parser', () => mockCookieParser);
jest.mock('compression', () => mockCompression);

const fastify = require('../lib/fastify');

describe('fastify', () => {
  let gasket, mockMwPlugins;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMwPlugins = [];

    gasket = {
      middleware: {},
      logger: {},
      config: {},
      execApply: jest.fn(async function (lifecycle, fn) {
        for (let i = 0; i < mockMwPlugins.length; i++) {
          // eslint-disable-next-line  no-loop-func
          fn(mockMwPlugins[i], () => mockMwPlugins[i]);
        }
        return jest.fn();
      })
    };
  });

  it('registers the middie middleware plugin', async () => {
    await fastify(gasket, app);

    expect(app.register).toHaveBeenCalledWith(middie);
  });
});
