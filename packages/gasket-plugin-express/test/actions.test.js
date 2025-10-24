import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getAppInstance } from '../lib/utils.js';
import actions from '../lib/actions.js';

const { getExpressApp } = actions;

vi.mock('../lib/utils.js');

const mockApp = { use: vi.fn(), post: vi.fn(), set: vi.fn() };

describe('getExpressApp', () => {
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

  it('returns the express instance', function () {
    const result = getExpressApp(gasket);
    expect(result).toEqual(mockApp);
  });

  it('returns same instance for repeated calls', function () {
    const result = getExpressApp(gasket);
    expect(result).toEqual(mockApp);

    const result2 = getExpressApp(gasket);
    expect(result2).toBe(result);

    expect(getAppInstance).toHaveBeenCalledTimes(2);
  });

  it('logs deprecation warning', function () {
    getExpressApp(gasket);
    expect(gasket.logger.warn).toHaveBeenCalledWith(
      `DEPRECATED \`getExpressApp\` action will not be support in future major release.`
    );
  });
});
