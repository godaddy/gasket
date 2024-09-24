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
const plugin = require('../lib/index');
const { name, version, description } = require('../package');

describe('Plugin', () => {

  beforeEach(function () {
    mockAPM.isStarted.mockReset();
    process.env.ELASTIC_APM_SERVER_URL = 'FAKE_ELASTIC_APM_URL';
    process.env.ELASTIC_APM_SECRET_TOKEN = 'TOKEN_1234';
  });

  afterEach(function () {
    jest.clearAllMocks();

    delete process.env.ELASTIC_APM_SERVER_URL;
    delete process.env.ELASTIC_APM_SECRET_TOKEN;
    delete process.env.ELASTIC_APM_ACTIVE;
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
    expect(plugin).toHaveProperty('actions');
    expect(plugin).toHaveProperty('hooks');
  });

  it('has expected hooks', () => {
    const expected = [
      'configure',
      'create',
      'metadata'
    ];

    expect(Object.keys(plugin.hooks)).toEqual(expected);
  });
});
