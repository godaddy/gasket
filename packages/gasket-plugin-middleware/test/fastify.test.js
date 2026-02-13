import { describe, it, expect, beforeEach, vi } from 'vitest';

const app = {
  ready: vi.fn(),
  server: {
    emit: vi.fn()
  },
  register: vi.fn(),
  use: vi.fn(),
  addHook: vi.fn(),
  express: null
};

app.express = app;

const cookieParserMiddleware = vi.fn();
const compressionMiddleware = vi.fn();
const mockCookieParser = vi.fn().mockReturnValue(cookieParserMiddleware);
const mockCompression = vi.fn().mockReturnValue(compressionMiddleware);

vi.mock('@fastify/express', () => ({ default: vi.fn() }));
vi.mock('cookie-parser', () => ({ default: mockCookieParser }));
vi.mock('compression', () => ({ default: mockCompression }));

const fastify = (await import('../lib/fastify.js')).default;

describe('fastify', () => {
  let gasket, mockMwPlugins;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMwPlugins = [];

    gasket = {
      middleware: {},
      logger: {},
      config: {},
      execApply: vi.fn(async function (lifecycle, fn) {
        for (let i = 0; i < mockMwPlugins.length; i++) {
          // eslint-disable-next-line  no-loop-func
          fn(mockMwPlugins[i], () => mockMwPlugins[i]);
        }
        return vi.fn();
      })
    };
  });

  it('registers the @fastify/express plugin', async () => {
    await fastify(gasket, app);

    expect(app.register).toHaveBeenCalled();
  });

  it('adds middleware to attach res.locals', async () => {
    await fastify(gasket, app);

    const middleware = app.addHook.mock.calls[0][1];
    expect(middleware.name).toEqual('attachLocals');

    const res = {};
    const next = vi.fn();
    middleware({}, res, next);

    expect(res).toHaveProperty('locals');
    expect(res.locals).toEqual({});
    expect(next).toHaveBeenCalled();
  });
});
