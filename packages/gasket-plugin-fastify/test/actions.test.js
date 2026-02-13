import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../lib/utils.js');
const { getAppInstance } = await import('../lib/utils.js');
const actions = await import('../lib/actions.js');
const { getFastifyApp } = actions.default;

const mockApp = { use: vi.fn(), post: vi.fn(), set: vi.fn() };

describe('getFastifyApp', () => {
  let gasket;

  beforeEach(() => {
    getAppInstance.mockReturnValue(mockApp);
    gasket = {
      logger: {
        warn: vi.fn()
      },
      config: {}
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the fastify instance', function () {
    const result = getFastifyApp(gasket);
    expect(result).toEqual(mockApp);
  });

  it('returns same instance for repeated calls', function () {
    const result = getFastifyApp(gasket);
    expect(result).toEqual(mockApp);

    const result2 = getFastifyApp(gasket);
    expect(result2).toBe(result);

    expect(getAppInstance).toHaveBeenCalledTimes(2);
  });

  it('logs deprecation warning', function () {
    getFastifyApp(gasket);
    expect(gasket.logger.warn).toHaveBeenCalledWith(
      `DEPRECATED \`getFastifyApp\` action will not be support in future major release.`
    );
  });
});
