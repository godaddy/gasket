jest.mock('/path/to/directory/package.json', () => ({ name: 'appName' }), { virtual: true });

const WebpackMetricsPlugin = require('../lib/webpack-metrics-plugin');

const gasket = {
  logger: {
    debug: jest.fn()
  },
  config: {
    manifest: { name: 'foo' }
  }
};
const metricsPlugin = new WebpackMetricsPlugin({ gasket });

describe('webpack metrics plugin', function () {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs metric details', function () {

    const tap = jest.fn().mockImplementation((_, fn) => fn({
      assets: {
        'test/thing/baz1.jpg': { size: jest.fn() },
        'test/thing/baz2.css': { size: jest.fn() },
        'test/thing2/baz1.js': { size: jest.fn() },
        'test/thing2/baz2.html': { size: jest.fn() }
      }
    }));

    metricsPlugin.apply({
      options: {
        target: 'web',
        context: '/path/to/directory'
      },
      hooks: {
        emit: {
          tap
        }
      },
      metrics: jest.fn()
    });

    expect(gasket.logger.debug).toHaveBeenCalledWith(expect.stringContaining('webpack metrics:'));
    expect(gasket.logger.debug).toHaveBeenCalledWith(expect.stringContaining('"name": "appName"'));
    expect(gasket.logger.debug).toHaveBeenCalledWith(expect.stringContaining('"event": "webpack"'));
  });

  it('plugins executes expected webpack hook', function () {
    const tap = jest.fn().mockImplementation((_, fn) => fn({
      assets: {
        'test/thing/baz1.jpg': { size: jest.fn() },
        'test/thing/baz2.css': { size: jest.fn() },
        'test/thing2/baz1.js': { size: jest.fn() },
        'test/thing2/baz2.html': { size: jest.fn() }
      }
    }));

    metricsPlugin.apply({
      options: {
        target: 'web',
        context: '/path/to/directory'
      },
      hooks: {
        emit: {
          tap
        }
      }
    });

    expect(tap).toHaveBeenCalledWith('WebpackMetricsPlugin', expect.any(Function));
  });

  it('metric lifecycle only called once', function () {
    const tap = jest.fn().mockImplementation((_, fn) => fn({
      assets: {
        'test/thing/baz1.jpg': { size: jest.fn() },
        'test/thing/baz2.css': { size: jest.fn() },
        'test/thing2/baz1.js': { size: jest.fn() },
        'test/thing2/baz2.html': { size: jest.fn() }
      }
    }));

    metricsPlugin.apply({
      options: {
        target: 'web',
        context: '/path/to/directory'
      },
      hooks: {
        emit: {
          tap
        }
      }
    });

    expect(gasket.logger.debug).toHaveBeenCalledTimes(1);
  });
});
