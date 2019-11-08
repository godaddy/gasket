const concat = require('concat-stream');
const { spawn } = require('child_process');
const { test } = require('@oclif/test');
const assume = require('assume');
const { spy, stub } = require('sinon');
const proxyquire = require('proxyquire');
const stdMocks = require('std-mocks');
const path = require('path');
const { Fetcher } = require('../src/scaffold/fetcher');

const gasketBin = exports.gasketBin = path.join(__dirname, '..', 'bin', 'run');
const dirs = exports.dirs = {
  create: path.join(__dirname, 'fixtures', 'create'),
  fixtures: path.join(__dirname, 'fixtures'),
  packages: path.join(__dirname, 'fixtures', 'packages')
};

exports.DOWN = '\x1B\x5B\x42';
exports.UP = '\x1B\x5B\x41';
exports.ENTER = '\x0D';

exports.getCommandWithMocks = function getCommandWithMocks(command) {
  const gasket = {
    exec: spy(),
    execWaterfall: stub().callsFake((event, payload) => {
      return payload;
    }),
    config: {}
  };

  const PluginEngine = stub().returns(gasket);

  const Command = proxyquire(`../src/commands/${command}`, {
    '../command': proxyquire('../src/command', {
      '@gasket/engine': PluginEngine
    })
  });

  return { Command, PluginEngine, gasket };
};

exports.vacuumApp = function vacuumApp(appName = 'myapp') {
  return async function megamaid() {
    await new Fetcher().vacuum(
      path.join(dirs.create, appName)
    );
  };
};

exports.assumeGasketExec = function assumeGasketExec({
  argv,
  spawnWith,
  assert,
  setup
}) {
  return async function assumedSpawn() {
    if (setup) await setup();

    return new Promise((fulfill, reject) => {
      const gasket = spawn(gasketBin, argv, spawnWith);

      let stderr;
      let stdout;
      let timerId;

      gasket.stderr.pipe(concat({ encoding: 'string' }, lines => {
        stderr = lines;
      }));

      gasket.stdout.pipe(concat({ encoding: 'string' }, lines => {
        stdout = lines;
      }));

      gasket.stdin.setEncoding('utf-8');

      /**
       * spams ENTER every second for prompt defaults
       */
      const applyInputs = () => {
        timerId = setTimeout(function () {
          gasket.stdin.write(exports.ENTER);
          applyInputs();
        }, 1000);
      };

      applyInputs();

      if (process.env.GASKET_DEBUG_TESTS) {
        gasket.stderr.pipe(process.stderr);
        gasket.stdout.pipe(process.stdout);
      }

      gasket.on('close', (code, signal) => {
        clearTimeout(timerId);
        gasket.stdin.end();

        const ctx = {
          code,
          signal,
          argv,
          spawnWith,
          stdout,
          stderr
        };

        if (assert) {
          try {
            assert(ctx);
            return fulfill();
          } catch (err) {
            return reject(err);
          }
        }

        // In the absence of an explicit assert to call
        // simply respond with all of the output from the process.
        // It is up to the caller to decide what "failure" means
        // for the given test.
        fulfill(ctx);
      });
    });
  };
};

exports.oclif = test
  .register('stdmock', () => ({
    run() {
      stdMocks.use();
    }
  }))
  .register('stdflush', (expected = {}) => ({
    finally() {
      stdMocks.restore();
      const actual = stdMocks.flush();
      for (const std of Object.keys(expected)) {
        assume(actual[std]).deep.equals(
          expected[std],
          `${std} did not match`
        );
      }
    }
  }))
  .register('fail', ({ code = 1, message }) => ({
    catch(ctx) {
      const err = ctx.error;
      const { exit } = err.oclif || {};
      assume(exit).equals(code, 'unexpeted exit code');
      assume(err.message).includes(message, 'unexpected failure reason');
    }
  }));

exports.mockActionWrapper = (lbl, fn) => {
  const spinnerStub = {
    text: lbl,
    start: stub(),
    success: stub(),
    warn: stub(),
    fail: stub()
  };

  const wrapper = ctx => {
    return fn(ctx, spinnerStub);
  };

  wrapper.wrapped = fn;

  return wrapper;
};
