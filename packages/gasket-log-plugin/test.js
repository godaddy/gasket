const { describe, it } = require('mocha');
const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const Plugin = require('./index');

assume.use(require('assume-sinon'));

/*
 * Simple helper that returns the Plugin with a custom assertion
 * to be invoked on creation of Log instances
 */
function assumeLogInit(assertFn) {
  return proxyquire('./index', {
    '@gasket/log': function Log(opts) {
      assertFn(opts);
    }
  });
}

describe('log plugin', function () {
  it('exposes required properties', function () {
    assume(Plugin).to.have.property('hooks');
    assume(Plugin).to.have.property('name', 'log');
  });

  describe('.init', function () {
    it('runs on the init lifecycle event', function () {
      assume(Plugin.hooks.init.handler).to.be.an('asyncfunction');
      assume(Plugin.hooks.init.handler).to.have.length(1);
    });

    it('runs after the lifecycle plugin', function () {
      assume(Plugin.hooks.init.timing).property('after');
      assume(Plugin.hooks.init.timing.after).contains('lifecycle');
    });

    it('adds a logger instance to the Gasket object', async function () {
      const gasket = {
        exec: async function exec() {
        },
        command: {
          id: 'bogus'
        },
        config: {
          env: 'test',
          winston: {}
        }
      };

      assume(gasket).not.to.have.property('logger');
      await Plugin.hooks.init.handler(gasket);
      assume(gasket).to.have.property('logger');
    });

    it('execs the logTransports hook', async () => {
      const exec = sinon.stub().resolves();
      const gasket = {
        exec,
        command: {
          id: 'start'
        },
        config: {
          env: 'test'
        }
      };

      const plugin = assumeLogInit(() => {
        assume(exec).to.have.been.calledWith('logTransports');
      });

      await plugin.hooks.init.handler(gasket);
    });

    it('merges in any transports returned by the logTransports hook', async () => {
      // eslint-disable-next-line no-undefined
      const exec = sinon.stub().resolves(['bar', 'bazz', undefined, ['apple', 'banana'], [undefined]]);
      const gasket = {
        exec,
        command: {
          id: 'start'
        },
        config: {
          env: 'test',
          winston: {
            transports: ['foo']
          }
        }
      };

      const plugin = assumeLogInit(actual => {
        assume(actual.transports).deep.equals(['foo', 'bar', 'bazz', 'apple', 'banana']);
        assume(exec).to.have.been.calledWith('logTransports');
      });

      await plugin.hooks.init.handler(gasket);
    });

    it('sets defaults appropriately', async () => {
      const gasket = {
        exec: async function exec() {
          return null;
        },
        command: {
          id: 'start'
        },
        config: {
          env: 'test'
        }
      };

      const plugin = assumeLogInit(actual => {
        assume(actual.local).false();
        assume(actual.transports).is.an('array');
      });

      await plugin.hooks.init.handler(gasket);
    });

    it('sets local option for local env', async () => {
      const gasket = {
        exec: sinon.stub(),
        command: {
          id: 'start'
        },
        config: {
          env: 'local'
        }
      };

      const plugin = assumeLogInit(actual => {
        assume(actual.local).true();
      });

      await plugin.hooks.init.handler(gasket);
    });

    it('sets local option for non-start commands', async () => {
      const gasket = {
        exec: sinon.stub(),
        command: {
          id: 'fake'
        },
        config: {
          env: 'test'
        }
      };

      const plugin = assumeLogInit(actual => {
        assume(actual.local).true();
      });

      await plugin.hooks.init.handler(gasket);
    });

    it('supports older gasket.command format', async () => {
      const gasket = {
        exec: sinon.stub(),
        command: 'start',
        config: {
          env: 'test'
        }
      };

      const plugin = assumeLogInit(actual => {
        assume(actual.local).false();
      });

      await plugin.hooks.init.handler(gasket);
    });

    it('forces { exitOnError: true }', async () => {
      const gasket = {
        exec: async function exec() {
        },
        command: {
          id: 'bogus'
        },
        config: {
          winston: { exitOnError: false }
        }
      };

      const plugin = assumeLogInit(actual => {
        assume(actual.exitOnError).true();
      });

      await plugin.hooks.init.handler(gasket);
    });

    it('merges the correct configuration', async () => {
      const gasket = {
        exec: async function exec() {
        },
        config: {
          env: 'local',
          winston: {
            transports: ['foo', 'bar'],
            silent: false
          },
          log: { silent: true }
        }
      };

      const plugin = assumeLogInit(actual => {
        assume(actual.local).true();
        assume(actual.transports).deep.equals(['foo', 'bar']);
        assume(actual.silent).true();
      });

      await plugin.hooks.init.handler(gasket);
    });
  });

  describe('.create', function () {
    it('adds the expected dependencies', async function () {
      const calls = [];
      const spy = {
        pkg: {
          add(key, value) {
            calls.push({ key, value });
          }
        }
      };

      await Plugin.hooks.create({}, spy);
      assume(calls).deep.equals([
        { key: 'dependencies', value: { '@gasket/log': '^3.0.0' } }
      ]);
    });
  });

  describe('.destroy', function () {
    it('has destroy lifecycle event', function () {
      assume(Plugin.hooks.destroy).to.be.an('asyncfunction');
      assume(Plugin.hooks.destroy).to.have.length(1);
    });

    it('closes logger instance', async function () {
      const gasket = {
        logger: {
          close: sinon.spy()
        }
      };

      await Plugin.hooks.destroy(gasket);
      assume(gasket.logger.close).is.called();
    });
  });
});
