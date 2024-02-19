/* eslint-disable no-process-env */
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
        warning: jest.fn()
      },
      config: {
        root: '/some/path'
      }
    };
    process.env.ELASTIC_APM_SERVER_URL = 'FAKE_ELASTIC_APM_URL';
    process.env.ELASTIC_APM_SECRET_TOKEN = 'TOKEN_1234';
  });

  afterEach(function () {
    jest.clearAllMocks();

    delete process.env.ELASTIC_APM_SERVER_URL;
    delete process.env.ELASTIC_APM_SECRET_TOKEN;
    delete process.env.ELASTIC_APM_ACTIVE;
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

  it('skips preboot lifecycle if run locally', async () => {
    mockGasket.command = { id: 'local' };
    await plugin.hooks.preboot.handler(mockGasket);
    expect(apm.start).not.toHaveBeenCalled();
  });

  it('does not start within preboot', async function () {
    await plugin.hooks.preboot.handler(mockGasket);
    expect(apm.start).toHaveBeenCalledTimes(0);
    expect(mockGasket.logger.warning).toHaveBeenCalledWith(
      expect.stringContaining('Elastic APM agent is not started. Use `--require ./setup.js`')
    );
  });

  it('adds apm filters', async () => {
    mockAPM.isStarted.mockReturnValue(true);
    await plugin.hooks.preboot.handler(mockGasket);
    expect(apm.addFilter).toHaveBeenCalledTimes(1);
  });

  it('respects a user-defined "active" config value', async () => {
    delete process.env.ELASTIC_APM_SECRET_TOKEN;
    delete process.env.ELASTIC_APM_SECRET_TOKEN;
    process.env.ELASTIC_APM_ACTIVE = true;

    mockGasket.config = await plugin.hooks.configure.handler(mockGasket, {
      ...mockGasket.config,
      elasticAPM: { active: true }
    });
    await plugin.hooks.preboot.handler(mockGasket);
    expect(mockGasket.config.elasticAPM).toEqual({ active: true });
  });

  it('is not active if missing ELASTIC_APM_SERVER_URL env var', async () => {
    delete process.env.ELASTIC_APM_SERVER_URL;
    mockGasket.config = await plugin.hooks.configure.handler(mockGasket, {
      ...mockGasket.config
    });

    await plugin.hooks.preboot.handler(mockGasket);
    expect(mockGasket.config.elasticAPM).toEqual({ active: false });
  });

  it('is not active if missing ELASTIC_APM_SECRET_TOKEN env var', async () => {
    delete process.env.ELASTIC_APM_SECRET_TOKEN;
    mockGasket.config = await plugin.hooks.configure.handler(mockGasket, {
      ...mockGasket.config
    });
    await plugin.hooks.preboot.handler(mockGasket);
    expect(mockGasket.config.elasticAPM).toEqual({ active: false });
  });

  it('respects a user-defined "ELASTIC_APM_ACTIVE" env var', async () => {
    delete process.env.ELASTIC_APM_SECRET_TOKEN;
    delete process.env.ELASTIC_APM_SECRET_TOKEN;
    process.env.ELASTIC_APM_ACTIVE = true;

    mockGasket.config = await plugin.hooks.configure.handler(mockGasket, {
      ...mockGasket.config
    });
    await plugin.hooks.preboot.handler(mockGasket);
    expect(mockGasket.config.elasticAPM).toEqual({ active: true });
  });
});
