jest.mock('../lib/utils.js');
const { getAppInstance } = require('../lib/utils.js');
const actions = require('../lib/actions');
const { getExpressApp } = actions;

const mockApp = { use: jest.fn(), post: jest.fn(), set: jest.fn() };

describe('getExpressApp', () => {
  let gasket;

  beforeEach(() => {
    getAppInstance.mockReturnValue(mockApp);
    gasket = {
      logger: {
        warn: jest.fn()
      },
      config: {}
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
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
