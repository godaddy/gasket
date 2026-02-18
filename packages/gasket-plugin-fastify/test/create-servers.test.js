import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mockApp = {
  ready: vi.fn(),
  server: {
    emit: vi.fn()
  },
  register: vi.fn(),
  setErrorHandler: vi.fn()
};

vi.mock('../lib/utils.js');
const { getAppInstance } = await import('../lib/utils.js');
const createServers = (await import('../lib/create-servers.js')).default;

describe('createServers', () => {
  let gasket, lifecycles, mockMwPlugins;

  beforeEach(() => {
    getAppInstance.mockReturnValue(mockApp);
    mockMwPlugins = [];

    lifecycles = {
      errorMiddleware: vi.fn().mockResolvedValue([]),
      fastify: vi.fn().mockResolvedValue()
    };

    gasket = {
      logger: {},
      config: {
        fastify: {}
      },
      exec: vi.fn().mockImplementation((lifecycle, ...args) => lifecycles[lifecycle](args)),
      execApply: vi.fn(async function (lifecycle, fn) {
        for (let i = 0; i < mockMwPlugins.length; i++) {
          // eslint-disable-next-line  no-loop-func
          fn(mockMwPlugins[i], () => mockMwPlugins[i]);
        }
        return vi.fn();
      })
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the handler app', async function () {
    const result = await createServers(gasket, {});
    expect(result.handler).toEqual(expect.any(Function));

    const request = { mock: 'request' };
    await result.handler(request);

    expect(mockApp.ready).toHaveBeenCalled();
    expect(mockApp.server.emit).toHaveBeenCalledWith('request', request);
  });


  it('executes the `fastify` lifecycle', async function () {
    await createServers(gasket, {});
    expect(gasket.exec).toHaveBeenCalledWith('fastify', mockApp);
  });

  it('executes the `errorMiddleware` lifecycle', async function () {
    await createServers(gasket, {});
    expect(gasket.exec).toHaveBeenCalledWith('errorMiddleware');
  });

  it('executes the `errorMiddleware` lifecycle after the `fastify` lifecycle', async function () {
    await createServers(gasket, {});
    expect(gasket.exec.mock.calls[0]).toContain('fastify', mockApp);
    expect(gasket.exec.mock.calls[1]).toContain('errorMiddleware');
  });

  it('registers a single setErrorHandler when errorMiddleware exists', async () => {
    const errorMiddlewares = [vi.fn(), vi.fn()];
    gasket.exec.mockResolvedValue(errorMiddlewares);

    await createServers(gasket, {});

    expect(mockApp.setErrorHandler).toHaveBeenCalledTimes(1);
    expect(mockApp.setErrorHandler).toHaveBeenCalledWith(expect.any(Function));
  });

  it('does not register setErrorHandler when no errorMiddleware', async () => {
    gasket.exec.mockResolvedValue([]);

    await createServers(gasket, {});

    expect(mockApp.setErrorHandler).not.toHaveBeenCalled();
  });

  it('chains multiple errorMiddleware handlers in order', async () => {
    const calls = [];
    const mw1 = vi.fn((e, req, res, next) => { calls.push('mw1'); next(); });
    const mw2 = vi.fn((e, req, res, next) => { calls.push('mw2'); next(); });
    gasket.exec.mockResolvedValue([mw1, mw2]);

    await createServers(gasket, {});

    const handler = mockApp.setErrorHandler.mock.calls[0][0];
    const mockRequest = { raw: {} };
    const mockReply = { raw: {}, sent: false, send: vi.fn() };
    handler(new Error('test'), mockRequest, mockReply);

    expect(calls).toEqual(['mw1', 'mw2']);
    expect(mockReply.send).toHaveBeenCalled();
  });
});
