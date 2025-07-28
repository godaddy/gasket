const mockApp = {
  ready: jest.fn(),
  server: {
    emit: jest.fn()
  },
  register: jest.fn(),
  use: jest.fn()
};

jest.mock('../lib/utils.js');
const { getAppInstance } = require('../lib/utils.js');
const createServers = require('../lib/create-servers');

describe('createServers', () => {
  let gasket, lifecycles, mockMwPlugins;

  beforeEach(() => {
    getAppInstance.mockReturnValue(mockApp);
    mockMwPlugins = [];

    lifecycles = {
      middleware: jest.fn().mockResolvedValue([]),
      errorMiddleware: jest.fn().mockResolvedValue([]),
      fastify: jest.fn().mockResolvedValue()
    };

    gasket = {
      middleware: {},
      logger: {},
      config: {
        fastify: {}
      },
      exec: jest.fn().mockImplementation((lifecycle, ...args) => lifecycles[lifecycle](args)),
      execApply: jest.fn(async function (lifecycle, fn) {
        for (let i = 0; i < mockMwPlugins.length; i++) {
          // eslint-disable-next-line  no-loop-func
          fn(mockMwPlugins[i], () => mockMwPlugins[i]);
        }
        return jest.fn();
      })
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  it('adds the errorMiddleware', async () => {
    const errorMiddlewares = [jest.fn()];
    gasket.exec.mockResolvedValue(errorMiddlewares);

    await createServers(gasket, {});

    const errorMiddleware = findCall(
      mockApp.use,
      (mw) => mw === errorMiddlewares[0]);
    expect(errorMiddleware).not.toBeNull();
  });

  function findCall(aSpy, aPredicate) {
    const callIdx = findCallIndex(aSpy, aPredicate);
    return callIdx === -1 ? null : aSpy.mock.calls[callIdx][0];
  }

  function findCallIndex(aSpy, aPredicate) {
    return aSpy.mock.calls.map((args) => aPredicate(...args)).indexOf(true);
  }
});
