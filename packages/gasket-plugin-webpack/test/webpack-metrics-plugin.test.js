const assume = require('assume');
const sinon = require('sinon');
const mock = require('mock-require');

const WebpackMetricsPlugin = require('../lib/webpack-metrics-plugin');

describe('webpack metrics plugin', function () {
  let metricsPlugin;
  let gasket;

  beforeEach(function () {
    gasket = {
      exec: sinon.spy(sinon.stub()),
      config: {
        manifest: { name: 'foo' }
      }
    };
    metricsPlugin = new WebpackMetricsPlugin({ gasket });

    mock('/path/to/directory/package.json', { name: 'appName' });
  });

  it('initiates metric lifecycle with correct data format', function () {

    const tap = sinon.stub().yields({
      assets: {
        'test/thing/baz1.jpg': { size: sinon.stub() },
        'test/thing/baz2.css': { size: sinon.stub() },
        'test/thing2/baz1.js': { size: sinon.stub() },
        'test/thing2/baz2.html': { size: sinon.stub() }
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
      metrics: sinon.stub()
    });

    assume(gasket.exec).is.calledWith('metrics', sinon.match({
      name: 'appName',
      event: 'webpack',
      data: sinon.match.object,
      time: sinon.match.number
    }));
  });

  it('plugins executes expected webpack hook', function () {
    const tap = sinon.stub().yields({
      assets: {
        'test/thing/baz1.jpg': { size: sinon.stub() },
        'test/thing/baz2.css': { size: sinon.stub() },
        'test/thing2/baz1.js': { size: sinon.stub() },
        'test/thing2/baz2.html': { size: sinon.stub() }
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

    assume(tap).is.calledWith('WebpackMetricsPlugin');
  });

  it('metric lifecycle only called once', function () {
    const tap = sinon.stub().yields({
      assets: {
        'test/thing/baz1.jpg': { size: sinon.stub() },
        'test/thing/baz2.css': { size: sinon.stub() },
        'test/thing2/baz1.js': { size: sinon.stub() },
        'test/thing2/baz2.html': { size: sinon.stub() }
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

    assume(gasket.exec.calledOnce);
  });
});
