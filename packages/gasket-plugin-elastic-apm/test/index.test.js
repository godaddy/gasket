const apmGeneric = {
  start: jest.fn(),
  addFilter: jest.fn()
};

const mockAPM = {
  start: jest.fn().mockReturnValue(apmGeneric),
  addFilter: jest.fn().mockReturnValue(apmGeneric),
  isStarted: jest.fn()
};

jest.mock('elastic-apm-node', () => mockAPM);
const apm = require('elastic-apm-node');
const plugin = require('../lib/index');

describe('Plugin', () => {
  let mockGasket;

  beforeEach(function () {
    mockAPM.isStarted.mockReset();
    mockGasket = {
      logger: {
        notice: jest.fn()
      },
      config: {
        root: '/some/path'
      }
    };
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('exposes a configure lifecycle hook', () => {
    expect(typeof plugin.hooks).toStrictEqual('object');
    expect(typeof plugin.hooks.configure).toStrictEqual('object');
    expect(typeof plugin.hooks.configure.handler).toStrictEqual('function');
  });

  it('exposes a preboot lifecycle hook', () => {
    expect(typeof plugin.hooks).toStrictEqual('object');
    expect(typeof plugin.hooks.preboot).toStrictEqual('object');
    expect(typeof plugin.hooks.preboot.handler).toStrictEqual('function');
  });

  it('hooks the middleware lifecycle', () => {
    expect(plugin.hooks).toHaveProperty('middleware');
  });

  it('skips start call if already started', async () => {
    mockAPM.isStarted.mockReturnValue(true);
    await plugin.hooks.preboot.handler(mockGasket);
    expect(apm.start).not.toHaveBeenCalled();
  });

  it('adds apm filters', async () => {
    mockAPM.isStarted.mockReturnValue(true);
    await plugin.hooks.preboot.handler(mockGasket);
    expect(apm.addFilter).toHaveBeenCalledTimes(1);
  });

  it('calls apm.start()', async () => {
    mockGasket.config = await plugin.hooks.configure.handler(mockGasket, {
      ...mockGasket.config,
      elasticAPM: {
        secretToken: 'abcd',
        serverUrl: 'https://example.com'
      }
    });
    await plugin.hooks.preboot.handler(mockGasket);

    expect(apm.start).toHaveBeenCalledTimes(1);
    expect(apm.start).toHaveBeenCalledWith({ active: true, secretToken: 'abcd', serverUrl: 'https://example.com' });
  });

  it('skips preboot lifecycle if run locally', async () => {
    mockGasket.command = { id: 'local' };
    await plugin.hooks.preboot.handler(mockGasket);
    expect(apm.start).not.toHaveBeenCalled();
  });

  it('disables the agent if one of serverUrl and secretToken are not defined', async () => {
    mockGasket.config = await plugin.hooks.configure.handler(mockGasket, mockGasket.config);
    await plugin.hooks.preboot.handler(mockGasket);
    expect(apm.start).toHaveBeenCalledWith({ active: false });
  });

  it('respects a user-defined "active" config value', async () => {
    mockGasket.config = await plugin.hooks.configure.handler(mockGasket, {
      ...mockGasket.config,
      elasticAPM: { active: true }
    });
    await plugin.hooks.preboot.handler(mockGasket);
    expect(apm.start).toHaveBeenCalledWith({ active: true });
  });

  it('warns if starting within preboot', async function () {
    await plugin.hooks.preboot.handler(mockGasket);
    expect(apm.start).toHaveBeenCalledTimes(1);
    expect(mockGasket.logger.notice).toHaveBeenCalledWith(
      expect.stringContaining('DEPRECATED started Elastic APM agent late')
    );
  });

  it('warns if using deprecated gasket.config', async function () {
    mockGasket.config = await plugin.hooks.configure.handler(mockGasket, {
      ...mockGasket.config,
      elasticAPM: {
        secretToken: 'abcd',
        serverUrl: 'https://example.com'
      }
    });
    expect(mockGasket.logger.notice).toHaveBeenCalledWith(
      expect.stringMatching('DEPRECATED config `elasticAPM.serverUrl`. Use env var: ELASTIC_APM_SERVER_URL')
    );
    expect(mockGasket.logger.notice).toHaveBeenCalledWith(
      expect.stringMatching('DEPRECATED config `elasticAPM.secretToken`. Use env var: ELASTIC_APM_SECRET_TOKEN')
    );
  });
});
