import { describe, it } from 'mocha';
const { config } = require('winston');
import Log from '../client';
import assume from 'assume';
import sinon from 'sinon';

describe('Log', function () {
  let log;

  beforeEach(function () {
    log = new Log();
  });

  afterEach(function () {
    sinon.restore();
  });

  it('exports logger class', function () {
    assume(Log).to.be.a('function');
    assume(log).to.be.instanceof(Log);
  });

  it('exposes methods for syslog levels', function () {
    Object.keys(config.syslog.levels)
      .forEach(lvl => {
        assume(Log.levels).includes(lvl);
      });
  });

  it('has predefined prefix', function () {
    assume(Log.prefix).to.equal('client');
  });

  it('has logger for each level', function () {
    const write = sinon.stub(process.stdout, 'write');

    Log.levels.forEach(function (level, i) {
      const msg = `I will be logging as gasket:${ level }`;

      log[level](msg);
      assume(log[level]).to.be.a('function');
      assume(write.getCall(i).args[0]).to.contain(msg);
      assume(write.getCall(i).args[0]).to.include(`gasket:${level}`);
    });
  });

  it('can be configured for different namespaces', function () {
    log = new Log({ namespace: 'uxcore2' });

    const write = sinon.stub(process.stdout, 'write');
    log.log('test');

    assume(log).to.have.deep.property('namespace', ['uxcore2']);
    assume(write.getCall(0).args[0]).to.include('gasket:info:uxcore');
    assume(write.getCall(0).args[0]).to.include('test');
  });

  it('uses configured log level', function () {
    assume(log).to.have.property('level', 'info');

    log = new Log({ level: 'debug' });
    assume(log).to.have.property('level', 'debug');
  });

  describe('.log', function () {
    it('is a function', function () {
      assume(log.log).to.be.a('function');
    });

    it('defers arguments to appropriate diagnostics level', function () {
      const logger = sinon.stub(log, 'info');

      log.log('Simple log message', { additional: 'metadata' });
      assume(logger.getCall(0).args).to.deep.equal([
        'Simple log message',
        { additional: 'metadata' }
      ]);
    });
  });
});
