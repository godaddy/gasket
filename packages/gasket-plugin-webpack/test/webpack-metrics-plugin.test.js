import { vi } from 'vitest';

import WebpackMetricsPlugin from '../lib/webpack-metrics-plugin.js';

const gasket = {
  logger: {
    debug: vi.fn()
  },
  config: {
    manifest: { name: 'foo' }
  }
};
const metricsPlugin = new WebpackMetricsPlugin({ gasket });

describe('webpack metrics plugin', function () {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs metric details', function () {

    const tap = vi.fn().mockImplementation((_, fn) => fn({
      assets: {
        'test/thing/baz1.jpg': { size: vi.fn() },
        'test/thing/baz2.css': { size: vi.fn() },
        'test/thing2/baz1.js': { size: vi.fn() },
        'test/thing2/baz2.html': { size: vi.fn() }
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
      metrics: vi.fn()
    });

    expect(gasket.logger.debug).toHaveBeenCalledWith(expect.stringContaining('webpack metrics:'));
    expect(gasket.logger.debug).toHaveBeenCalledWith(expect.stringContaining('"name": "Gasket App"'));
    expect(gasket.logger.debug).toHaveBeenCalledWith(expect.stringContaining('"event": "webpack"'));
  });

  it('plugins executes expected webpack hook', function () {
    const tap = vi.fn().mockImplementation((_, fn) => fn({
      assets: {
        'test/thing/baz1.jpg': { size: vi.fn() },
        'test/thing/baz2.css': { size: vi.fn() },
        'test/thing2/baz1.js': { size: vi.fn() },
        'test/thing2/baz2.html': { size: vi.fn() }
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
    const tap = vi.fn().mockImplementation((_, fn) => fn({
      assets: {
        'test/thing/baz1.jpg': { size: vi.fn() },
        'test/thing/baz2.css': { size: vi.fn() },
        'test/thing2/baz1.js': { size: vi.fn() },
        'test/thing2/baz2.html': { size: vi.fn() }
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
