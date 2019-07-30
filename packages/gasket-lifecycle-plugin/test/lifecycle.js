const path = require('path');
const { describe, it } = require('mocha');
const assume = require('assume');
const PluginEngine = require('@gasket/plugin-engine');
const lifecycle = require('../');
const proxy = require('./proxy');

describe('lifecycle-plugin', function () {
  it('registers the middleware lifecycle', async function () {
    const engine = new PluginEngine({
      root: path.join(__dirname, './fixtures/with-lifecycles'),
      plugins: {
        add: [lifecycle]
      }
    });

    await engine.exec('init');
    let called = false;
    proxy.once('middleware', function (gasket, app) {
      assume(gasket).equals(engine);
      assume(app).equals('testing');

      called = true;
    });

    await engine.exec('middleware', 'testing');

    assume(called).is.true();
  });

  it('handles applications with no lifecycles directory', async () => {
    const engine = new PluginEngine({
      root: path.join(__dirname, './fixtures/without-lifecycles'),
      plugins: {
        add: [lifecycle]
      }
    });

    await engine.exec('init');
    await engine.exec('middleware', 'testing');
  });

  it('handles lifecycle files with timings specified', async () => {
    let called;
    const engine = new PluginEngine({
      root: path.join(__dirname, './fixtures/with-lifecycles'),
      plugins: {
        add: [lifecycle]
      }
    });
    await engine.exec('init');
    proxy.once('withTiming', function (gasket, arg) {
      assume(gasket).equals(engine);
      assume(arg).equals('testing');
      called = true;
    });

    await engine.exec('withTiming', 'testing');

    assume(called).is.true();
  });

  it('maps kebab-cased file names to camelCased event names', async () => {
    const engine = new PluginEngine({
      root: path.join(__dirname, './fixtures/kebab-cased'),
      plugins: {
        add: [lifecycle]
      }
    });
    await engine.exec('init');

    let called = false;
    proxy.once('someEvent', function (gasket, arg) {
      assume(gasket).equals(engine);
      assume(arg).equals('testing');
      called = true;
    });

    await engine.exec('someEvent', 'testing');
    assume(called).is.true();
  });
});
