import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setTimeout } from 'timers/promises';
import { getAppInstance } from '../lib/utils.js';
import createServers from '../lib/create-servers.js';

vi.mock('../lib/utils.js');

const mockApp = { use: vi.fn(), post: vi.fn(), set: vi.fn() };

describe('createServers', () => {
  let gasket, lifecycles, mockMwPlugins;
  const sandbox = vi.fn();

  beforeEach(() => {
    getAppInstance.mockReturnValue(mockApp);

    mockMwPlugins = [];

    lifecycles = {
      errorMiddleware: vi.fn().mockResolvedValue([]),
      express: vi.fn().mockResolvedValue()
    };

    gasket = {
      actions: {
        getExpressApp: vi.fn().mockReturnValue(mockApp)
      },
      middleware: {},
      logger: {
        warn: vi.fn()
      },
      config: {},
      exec: vi
        .fn()
        .mockImplementation((lifecycle, ...args) =>
          lifecycles[lifecycle](args)
        ),
      execApply: sandbox.mockImplementation(async function (lifecycle, fn) {
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
    expect(result).toEqual({ handler: mockApp });
  });

  it('executes the `express` lifecycle', async function () {
    await createServers(gasket, {});
    expect(gasket.exec).toHaveBeenCalledWith('express', mockApp);
  });

  it('executes the `errorMiddleware` lifecycle', async function () {
    await createServers(gasket, {});
    expect(gasket.exec).toHaveBeenCalledWith('errorMiddleware');
  });

  it('executes the `errorMiddleware` lifecycle after the `express` lifecycle', async function () {
    await createServers(gasket, {});
    expect(gasket.exec.mock.calls[0]).toContain('express', mockApp);
    expect(gasket.exec.mock.calls[1]).toContain('errorMiddleware');
  });

  it('adds the errorMiddleware', async () => {
    const errorMiddlewares = [vi.fn()];
    gasket.exec.mockResolvedValue(errorMiddlewares);

    await createServers(gasket, {});

    const errorMiddleware = findCall(
      mockApp.use,
      (mw) => mw === errorMiddlewares[0]
    );
    expect(errorMiddleware).not.toBeNull();
  });

  it('adds the errorMiddleware after API routes', async () => {
    const errorMiddlewares = [vi.fn()];
    gasket.exec.mockResolvedValue(errorMiddlewares);

    await createServers(gasket, {});
    await setTimeout(10); // Make sure routes aren't added asynchronously

    const errorIndex = findCallIndex(
      mockApp.use,
      (mw) => mw === errorMiddlewares[0]
    );

    expect(errorIndex).toEqual(mockApp.use.mock.calls.length - 1);
  });

  function findCall(aSpy, aPredicate) {
    const callIdx = findCallIndex(aSpy, aPredicate);
    return callIdx === -1 ? null : aSpy.mock.calls[callIdx][0];
  }

  function findCallIndex(aSpy, aPredicate) {
    return aSpy.mock.calls.map((args) => aPredicate(...args)).indexOf(true);
  }
});
