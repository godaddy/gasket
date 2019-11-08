const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const mockData = { some: 'data' };
const reportStub = sinon.stub().resolves(mockData);
const metricsStub = sinon.stub();

class MockMetrics {
  constructor() {
    metricsStub(...arguments);
  }
  report() {
    return reportStub(...arguments);
  }
}

const initHook = proxyquire('../lib/index', {
  './metrics': MockMetrics
}).hooks.init;


async function initHandler(mockGasket) {
  await initHook.handler(mockGasket);
  // because we don't wait the metric call to avoid blocking
  // fake a delay so we can test async results
  return new Promise(resolve => setTimeout(resolve, 30));
}

describe('init hook', function () {
  let mockGasket;

  beforeEach(() => {
    sinon.resetHistory();

    mockGasket = {
      exec: sinon.stub(),
      logger: {
        error: sinon.stub()
      }
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('sets timing after metadata', () => {
    assume(initHook.timing.after).includes('metadata');
  });

  it('instantiates Metrics object with gasket', async () => {
    await initHandler(mockGasket);
    assume(metricsStub).calledWith(mockGasket);
  });

  it('invokes metrics lifecycle with data', async () => {
    await initHandler(mockGasket);
    assume(mockGasket.exec).calledWith('metrics', mockData);
  });

  it('catches and logs any errors', async () => {
    const mockError = new Error('Bad things man');
    reportStub.rejects(mockError);

    await initHandler(mockGasket);
    assume(mockGasket.logger.error).calledWith('Bad things man');
  });

  it('uses console if not logger instance', async () => {
    const consoleStub = sinon.stub(console, 'error');
    delete mockGasket.logger;
    const mockError = new Error('Bad things man');
    reportStub.rejects(mockError);

    await initHandler(mockGasket);
    assume(consoleStub).calledWith('Bad things man');
  });

  it('logs stringified non error types', async () => {
    const mockError = 'BAD THINGS MAN';
    reportStub.rejects(mockError);

    await initHandler(mockGasket);
    assume(mockGasket.logger.error).calledWith('BAD THINGS MAN');
  });
});
