/* eslint-disable no-process-env */

import { describe, it } from 'mocha';
import { config } from 'winston';
import Log from '../src/client';
import assume from 'assume';
import sinon from 'sinon';

describe('Log', function () {
  let log;

  beforeEach(function () {
    process.env.NODE_ENV = 'test';
    process.env.DEBUG = 'gasket:*';
    log = new Log();
  });

  afterEach(function () {
    sinon.restore();
  });

  it('exports logger class', function () {
    assume(Log).to.be.a('function');
    assume(log).to.be.instanceof(Log);
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

  it('has an prod option to enable NODE_ENV=production logging', function () {
    process.env.NODE_ENV = 'production';
    const console = sinon.stub(global.console, 'log');

    log = new Log({ namespace: 'uxcore2', prod: true });
    log.info('something');

    assume(console.callCount).equals(1);
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

  describe('.levels', function () {
    function assumeDefaultLevels() {
      Object.keys(config.syslog.levels)
        .forEach(lvl => {
          assume(Log.levels).includes(lvl);
          assume(log[lvl]).to.be.a('function');
        });
    }

    it('exposes methods for default syslog levels', function () {
      assumeDefaultLevels();
    });

    it('allows custom levels', function () {
      log = new Log({ levels: [...Log.levels, 'weirdStuff'] });
      assumeDefaultLevels();
      assume(log.weirdStuff).to.be.a('function');
    });
  });
});
