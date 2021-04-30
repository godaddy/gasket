const { Transport, format, transports, config } = require('winston');
const { describe, it } = require('mocha');
const { SPLAT } = require('triple-beam');
const assume = require('assume');
const sinon = require('sinon');
const Log = require('../server');

/**
 * Simple helper to check finished state of the stream
 * that is `maybeDone`.
 *
 * @param {WritableStream} maybeDone Stream that may have finished.
 */
function assumeFinished(maybeDone) {
  assume(maybeDone._writableState).is.an('object');
  assume(maybeDone._writableState.finished).true();
}

describe('Log', function () {
  let log;

  beforeEach(function () {
    log = new Log({ local: true });
  });

  afterEach(function () {
    log = null;
    sinon.restore();
  });

  it('exports class', function () {
    assume(Log).to.be.a('function');
  });

  it('has default properties', function () {
    const options = {};
    log = new Log(options);

    assume(log).to.have.property('options', options);
    assume(log).to.have.property('local', false);
    assume(log).to.have.property('silent', false);
    assume(log).to.have.property('level', 'info');

    log = new Log({ local: true });
    assume(log).to.have.property('level', 'debug');

    log = new Log({ level: 'silly' });
    assume(log).to.have.property('level', 'silly');
  });

  it('exposes defaults as statics', function () {
    assume(Log.prefix).to.equal('server');
    assume(Log.format).to.have.property('color');
    assume(Log.Console).to.equal(transports.Console);
  });

  describe('Log.format.color', function () {
    let formatter;

    before(function () {
      formatter = Log.format.color();
    });

    it('color formats message', function () {
      const colored = formatter.transform({
        message: '%c I will be red %c',
        [SPLAT]: ['color: #FF0000']
      });

      assume(colored.message).to.equal('\x1b[38;5;196m I will be red \x1b[39;49m');
      assume(colored.meta).to.have.length(0);
    });

    it('can handle unclosed coloring tokens', function () {
      const colored = formatter.transform({
        message: '%c I will still work and be blue',
        [SPLAT]: ['color: #0000FF']
      });

      assume(colored.message).to.equal('\x1b[38;5;21m I will still work and be blue\x1b[39;49m');
      assume(colored.meta).to.have.length(0);
    });
  });

  describe('.prefix', function () {
    it('uses default prefix', function () {
      assume(log.prefix).equals('server');
    });

    it('uses prefix set in options', function () {
      log = new Log({ prefix: 'bogus' });
      assume(log.prefix).equals('bogus');
    });
  });

  describe('.log', function () {
    it('proxies to winston.log with predefined level', async function () {
      const stub = sinon.stub(log.winston, 'log');

      assume(log.log).to.be.a('function');

      log.log('Testing');
      assume(stub.getCall(0).args).to.deep.equal(['debug', 'Testing']);
    });
  });

  describe('.format', function () {
    //
    // Required hack to make the function observable.
    //
    Object.defineProperty(format, 'combine', {
      value: format.combine,
      enumerable: true
    });

    it('returns combined formats for environment `local`', function () {
      const spy = sinon.spy(format, 'combine');
      const formatters = log.format();

      assume(formatters).to.be.an('object');
      assume(formatters).to.have.property('options');
      assume(spy.getCall(0).args).to.deep.equal([
        Log.format.color(),
        format.colorize(),
        format.splat(),
        format.simple()
      ]);
    });

    it('returns level depending on environment', function () {
      const spy = sinon.spy(format, 'combine');

      log = new Log({ local: false });
      log.format();

      assume(spy.getCall(0).args).to.deep.equal([
        format.splat(),
        format.label({ label: Log.prefix }),
        format.json()
      ]);
    });

    it('allows for custom formats', function () {
      const spy = sinon.spy(format, 'combine');

      const myFormat = format.json();
      log = new Log({ local: false, format: myFormat });
      const logFormat = log.format();

      assume(spy.callCount).to.equal(0);
      assume(logFormat).to.be.equal(myFormat);
    });
  });

  describe('.levels', function () {
    it('provides default levels', function () {
      assume(Log.levels).to.deep.equal(config.syslog.levels);
      assume(log.levels).to.deep.equal(config.syslog.levels);
    });

    it('throws if expected levels are not supplied in custom levels', function () {
      assume(() => new Log({ local: false, levels: { weirdStuff: 1337 } }))
        .to.throw(`'levels' is missing necessary levels: emerg, alert, crit, error, warning, notice, info, debug`);
    });

    it('allows custom levels', function () {
      log = new Log({ local: false, levels: { ...Log.levels, weirdStuff: 1337 } });
      assume(Log.levels).to.deep.equal(config.syslog.levels);
      assume(log.levels).to.deep.equal({ ...Log.levels, weirdStuff: 1337 });
      assume(log.weirdStuff).to.be.a('function');
    });
  });

  describe('.transports', function () {
    it('returns winston a Console transport by default', function () {
      let transporters = log.transports();

      assume(transporters).to.be.an('array');
      assume(transporters).to.have.length(1);

      log = new Log({ local: false });
      transporters = log.transports();

      assume(transporters).to.be.an('array');
      assume(transporters).to.have.length(1);
    });

    it('returns the user-provided transports (if set)', () => {
      const expected = [
        new transports.Console(),
        new transports.Console()
      ];

      log = new Log({ transports: expected });
      const actual = log.transports();

      assume(actual).to.be.an('array');
      assume(actual).to.have.length(2);
      assume(actual).equals(expected);
    });
  });

  describe('.close', function () {
    it('returns for default values', async function () {
      await log.close();
      assumeFinished(log.winston);
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
      assumeFinished(log.winston);
      assumeFinished(expected[0]);
      assumeFinished(expected[1]);
    });
  });

  describe('.spawn', function () {
    it('has proxy methods to winston log level', async () => {
      log.spawn();

      Object.keys(config.syslog.levels).forEach(function each(level) {
        assume(log).to.have.property(level);
        assume(log[level]).to.be.a('function');
      });
    });

    it('returns winston instance', function () {
      assume(log.spawn()).to.be.an('object');
    });

    it('exposes methods for syslog levels', function () {
      log.spawn();

      Object.keys(config.syslog.levels)
        .forEach(lvl => {
          assume(log).to.have.property(lvl);
          assume(log[lvl]).is.a('function');
        });
    });
  });
});
