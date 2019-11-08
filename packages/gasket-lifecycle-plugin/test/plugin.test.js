const path = require('path');
const { describe, it } = require('mocha');
const assume = require('assume');
const PluginEngine = require('@gasket/engine');
const plugin = require('../');
const proxy = require('./proxy');

describe('Plugin', function () {

  it('is an object', () => {
    assume(plugin).is.an('object');
  });

  it('has expected name', () => {
    assume(plugin).to.have.property('name', '@gasket/lifecycle');
  });

  it('has expected hooks', () => {
    const expected = [
      'init'
    ];

    assume(plugin).to.have.property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
  });

  it('registers the middleware lifecycle', async function () {
    const engine = new PluginEngine({
      root: path.join(__dirname, './fixtures/with-lifecycles'),
      plugins: {
        add: [plugin]
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
        add: [plugin]
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
        add: [plugin]
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
        add: [plugin]
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
