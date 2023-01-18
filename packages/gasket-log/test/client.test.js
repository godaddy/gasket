/* eslint-disable no-process-env, jest/expect-expect */
import { config } from 'winston';
import Log from '../src/client';

describe('Log', function () {
  let log;

  beforeEach(function () {
    process.env.NODE_ENV = 'test';
    process.env.DEBUG = 'gasket:*';
    log = new Log();
    jest.resetAllMocks();
  });

  it('exports logger class', function () {
    expect(Log).toEqual(expect.any(Function));
    expect(log).toBeInstanceOf(Log);
  });

  it('has predefined prefix', function () {
    expect(Log.prefix).toEqual('client');
  });

  it('has logger for each level', function () {
    // had to change from process.stdout "write" to get passing test
    const write = jest.spyOn(console, 'log').mockImplementation(msg => msg);

    Log.levels.forEach(function (level, i) {
      const msg = `I will be logging as gasket:${level}`;

      log[level](msg);
      expect(log[level]).toEqual(expect.any(Function));
      expect(write.mock.calls[i][0]).toContain(msg);
      expect(write.mock.calls[i][0]).toContain(`gasket:${level}`);
    });
  });

  it('can be configured for different namespaces', function () {
    log = new Log({ namespace: 'uxcore2' });

    // had to change from process.stdout "write" to get passing test
    const write = jest.spyOn(console, 'log').mockImplementation(msg => msg);
    log.log('test');

    expect(log).toHaveProperty('namespace', ['uxcore2']);
    expect(write.mock.calls[0][0]).toContain('gasket:info:uxcore');
    expect(write.mock.calls[0][0]).toContain('test');
  });

  it('uses configured log level', function () {
    expect(log).toHaveProperty('level', 'info');

    log = new Log({ level: 'debug' });
    expect(log).toHaveProperty('level', 'debug');
  });

  it('has an prod option to enable NODE_ENV=production logging', function () {
    process.env.NODE_ENV = 'production';
    const console = jest.spyOn(global.console, 'log');

    log = new Log({ namespace: 'uxcore2', prod: true });
    log.info('something');

    expect(console.mock.calls.length).toEqual(1);
  });

  describe('.log', function () {
    it('is a function', function () {
      expect(log.log).toEqual(expect.any(Function));
    });

    it('defers arguments to appropriate diagnostics level', function () {
      const logger = jest.spyOn(log, 'info');

      log.log('Simple log message', { additional: 'metadata' });
      expect(logger.mock.calls[0]).toEqual([
        'Simple log message',
        { additional: 'metadata' }
      ]);
    });
  });

  describe('.levels', function () {
    function expectDefaultLevels() {
      Object.keys(config.syslog.levels)
        .forEach(lvl => {
          expect(Log.levels).toContain(lvl);
          expect(log[lvl]).toEqual(expect.any(Function));
        });
    }

    it('exposes methods for default syslog levels', function () {
      expectDefaultLevels();
    });

    it('allows custom levels', function () {
      log = new Log({ levels: [...Log.levels, 'weirdStuff'] });
      expectDefaultLevels();
      expect(log.weirdStuff).toEqual(expect.any(Function));
    });
  });
});
