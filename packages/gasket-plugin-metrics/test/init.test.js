const mockData = { some: 'data' };
const mockReportStub = jest.fn().mockResolvedValue(mockData);
const mockMetricsStub = jest.fn();

class MockMetrics {
  constructor() {
    mockMetricsStub(...arguments);
  }
  report() {
    return mockReportStub(...arguments);
  }
}

jest.mock('../lib/metrics', () => MockMetrics);

const initHook = require('../lib/index').hooks.init;

async function initHandler(mockGasket) {
  await initHook.handler(mockGasket);
  // because we don't wait the metric call to avoid blocking
  // fake a delay so we can test async results
  return new Promise(resolve => setTimeout(resolve, 30));
}

describe('init hook', function () {
  let mockGasket;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGasket = {
      exec: jest.fn(),
      logger: {
        error: jest.fn()
      }
    };
  });

  it('sets timing after metadata', () => {
    expect(initHook.timing.after).toContain('@gasket/plugin-metadata');
  });

  it('instantiates Metrics object with gasket', async () => {
    await initHandler(mockGasket);
    expect(mockMetricsStub).toHaveBeenCalledWith(mockGasket);
  });

  it('invokes metrics lifecycle with data', async () => {
    await initHandler(mockGasket);
    expect(mockGasket.exec).toHaveBeenCalledWith('metrics', mockData);
  });

  it('catches and logs any errors', async () => {
    const mockError = new Error('Bad things man');
    mockReportStub.mockRejectedValue(mockError);

    await initHandler(mockGasket);
    expect(mockGasket.logger.error).toHaveBeenCalledWith('Bad things man');
  });

  it('uses console if not logger instance', async () => {
    const consoleStub = jest.spyOn(console, 'error').mockReturnValue();
    delete mockGasket.logger;
    const mockError = new Error('Bad things man');
    mockReportStub.mockRejectedValue(mockError);

    await initHandler(mockGasket);
    expect(consoleStub).toHaveBeenCalledWith('Bad things man');
  });

  it('logs stringified non error types', async () => {
    const mockError = 'BAD THINGS MAN';
    mockReportStub.mockRejectedValue(mockError);

    await initHandler(mockGasket);
    expect(mockGasket.logger.error).toHaveBeenCalledWith('BAD THINGS MAN');
  });
});
