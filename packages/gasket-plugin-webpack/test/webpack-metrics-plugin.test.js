const mock = require('mock-require');

jest.mock('/path/to/directory/package.json', () => ({ name: 'appName' }), { virtual: true });

const WebpackMetricsPlugin = require('../lib/webpack-metrics-plugin');

const gasket = {
  exec: jest.fn(),
  config: {
    manifest: { name: 'foo' }
  }
};
const metricsPlugin = new WebpackMetricsPlugin({ gasket });

describe('webpack metrics plugin', function () {

  it.only('initiates metric lifecycle with correct data format', function () {

    const tap = jest.fn().mockReturnValue({
      assets: {
        'test/thing/baz1.jpg': { size: jest.fn() },
        'test/thing/baz2.css': { size: jest.fn() },
        'test/thing2/baz1.js': { size: jest.fn() },
        'test/thing2/baz2.html': { size: jest.fn() }
      }
    });

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

    expect(gasket.exec).toHaveBeenCalledWith('metrics', expect.objectContaining({
      name: 'appName',
      event: 'webpack',
      data: expect.any(Object),
      time: expect.any(Number)
    }));
  });

  it('plugins executes expected webpack hook', function () {
    const tap = jest.fn().mockReturnValue({
      assets: {
        'test/thing/baz1.jpg': { size: jest.fn() },
        'test/thing/baz2.css': { size: jest.fn() },
        'test/thing2/baz1.js': { size: jest.fn() },
        'test/thing2/baz2.html': { size: jest.fn() }
      }
    });

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
    const tap = jest.fn().mockReturnValue({
      assets: {
        'test/thing/baz1.jpg': { size: jest.fn() },
        'test/thing/baz2.css': { size: jest.fn() },
        'test/thing2/baz1.js': { size: jest.fn() },
        'test/thing2/baz2.html': { size: jest.fn() }
      }
    });

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

    expect(gasket.exec.mock.calls).toHaveLength(1);
  });
});
