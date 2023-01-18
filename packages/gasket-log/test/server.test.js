/* eslint-disable jest/expect-expect */
const { Transport, format, transports, config } = require('winston');
const { SPLAT } = require('triple-beam');
const Log = require('../src/server');

/**
 * Simple helper to check finished state of the stream
 * that is `maybeDone`.
 *
 * @param {WritableStream} maybeDone Stream that may have finished.
 */
function expectFinished(maybeDone) {
  expect(maybeDone._writableState).toEqual(expect.any(Object));
  expect(maybeDone._writableState.finished).toEqual(true);
}

describe('Log', function () {
  let log;

  beforeEach(function () {
    log = new Log({ local: true });
    jest.resetAllMocks();
  });

  afterEach(function () {
    log = null;
  });

  it('exports class', function () {
    expect(Log).toEqual(expect.any(Function));
  });

  it('has default properties', function () {
    const options = {};
    log = new Log(options);

    expect(log).toHaveProperty('options', options);
    expect(log).toHaveProperty('local', false);
    expect(log).toHaveProperty('silent', false);
    expect(log).toHaveProperty('level', 'info');

    log = new Log({ local: true });
    expect(log).toHaveProperty('level', 'debug');

    log = new Log({ level: 'silly' });
    expect(log).toHaveProperty('level', 'silly');
  });

  it('exposes defaults as statics', function () {
    expect(Log.prefix).toEqual('server');
    expect(Log.format).toHaveProperty('color');
    expect(Log.Console).toEqual(transports.Console);
  });

  describe('Log.format.color', function () {
    let formatter;

    beforeEach(function () {
      formatter = Log.format.color();
    });

    it('color formats message', function () {
      const colored = formatter.transform({
        message: '%c I will be red %c',
        [SPLAT]: ['color: #FF0000']
      });

      expect(colored.message).toEqual('\x1b[38;5;196m I will be red \x1b[39;49m');
      expect(colored?.meta?.length || []).toHaveLength(0);
    });

    it('can handle unclosed coloring tokens', function () {
      const colored = formatter.transform({
        message: '%c I will still work and be blue',
        [SPLAT]: ['color: #0000FF']
      });

      expect(colored.message).toEqual('\x1b[38;5;21m I will still work and be blue\x1b[39;49m');
      expect(colored?.meta?.length || []).toHaveLength(0);
    });
  });

  describe('.prefix', function () {
    it('uses default prefix', function () {
      expect(log.prefix).toEqual('server');
    });

    it('uses prefix set in options', function () {
      log = new Log({ prefix: 'bogus' });
      expect(log.prefix).toEqual('bogus');
    });
  });

  describe('.log', function () {
    it('proxies to winston.log with predefined level', async function () {
      const stub = jest.spyOn(log.winston, 'log');

      expect(log.log).toEqual(expect.any(Function));

      log.log('Testing');
      expect(stub.mock.calls[0]).toEqual(['debug', 'Testing']);
    });
  });

  describe('.format', function () {
    //
    // Required hack to make the function observable.
    //
    Object.defineProperty(format, 'combine', {
      writable: true,
      value: format.combine,
      enumerable: true
    });

    it('returns combined formats for environment `local`', function () {
      const spy = jest.spyOn(format, 'combine');
      const formatters = log.format();

      expect(formatters).toEqual(expect.any(Object));
      expect(formatters).toHaveProperty('options');
      expect(spy.mock.calls[0]).toEqual([
        Log.format.color(),
        format.colorize(),
        format.splat(),
        format.simple()
      ]);
    });

    it('returns level depending on environment', function () {
      const spy = jest.spyOn(format, 'combine');

      log = new Log({ local: false });
      log.format();

      expect(spy.mock.calls[0]).toEqual([
        format.splat(),
        format.label({ label: Log.prefix }),
        format.json()
      ]);
    });

    it('allows for custom formats', function () {
      const spy = jest.spyOn(format, 'combine');

      const myFormat = format.json();
      log = new Log({ local: false, format: myFormat });
      const logFormat = log.format();

      expect(spy.mock.calls.length).toEqual(0);
      expect(logFormat).toEqual(myFormat);
    });
  });

  describe('.levels', function () {
    it('provides default levels', function () {
      expect(Log.levels).toEqual(config.syslog.levels);
      expect(log.levels).toEqual(config.syslog.levels);
    });

    it('throws if expected levels are not supplied in custom levels', function () {
      expect(() => new Log({ local: false, levels: { weirdStuff: 1337 } }))
        .toThrow(`'levels' is missing necessary levels: emerg, alert, crit, error, warning, notice, info, debug`);
    });

    it('allows custom levels', function () {
      log = new Log({ local: false, levels: { ...Log.levels, weirdStuff: 1337 } });
      expect(Log.levels).toEqual(config.syslog.levels);
      expect(log.levels).toEqual({ ...Log.levels, weirdStuff: 1337 });
      expect(log.weirdStuff).toEqual(expect.any(Function));
    });
  });

  describe('.transports', function () {
    it('returns winston a Console transport by default', function () {
      let transporters = log.transports();

      expect(transporters).toEqual(expect.any(Array));
      expect(transporters).toHaveLength(1);

      log = new Log({ local: false });
      transporters = log.transports();

      expect(transporters).toEqual(expect.any(Array));
      expect(transporters).toHaveLength(1);
    });

    it('returns the user-provided transports (if set)', () => {
      const expected = [
        new transports.Console(),
        new transports.Console()
      ];

      log = new Log({ transports: expected });
      const actual = log.transports();

      expect(actual).toEqual(expect.any(Array));
      expect(actual).toHaveLength(2);
      expect(actual).toEqual(expected);
    });
  });

  describe('.close', function () {
    it('returns for default values', async function () {
      await log.close();
      expectFinished(log.winston);
    });

    it('awaits any _final to occur', async function () {
      class CleanupTransport extends Transport {
        log(info, callback) {
          // Do nothing with info
          if (callback) return callback();
        }

        _final(callback) {
          setTimeout(callback, 200);
        }
      }

      const expected = [
        new transports.Console(),
        new CleanupTransport()
      ];

      log = new Log({ transports: expected });

      await log.close();
      expectFinished(log.winston);
      expectFinished(expected[0]);
      expectFinished(expected[1]);
    });
  });

  describe('.spawn', function () {
    it('has proxy methods to winston log level', async () => {
      log.spawn();

      Object.keys(config.syslog.levels).forEach(function each(level) {
        expect(log).toHaveProperty(level);
        expect(log[level]).toEqual(expect.any(Function));
      });
    });

    it('returns winston instance', function () {
      expect(log.spawn()).toEqual(expect.any(Object));
    });

    it('exposes methods for syslog levels', function () {
      log.spawn();

      Object.keys(config.syslog.levels)
        .forEach(lvl => {
          expect(log).toHaveProperty(lvl);
          expect(log[lvl]).toEqual(expect.any(Function));
        });
    });
  });
});
