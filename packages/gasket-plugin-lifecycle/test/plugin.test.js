/* eslint-disable jest/expect-expect */
const path = require('path');
const GasketEngine = require('@gasket/engine');
const plugin = require('../lib/');
const proxy = require('./proxy');

function setupEngine(root) {
  const engine = new GasketEngine([plugin]);
  engine.config = {
    root
  };

  return engine;
}

describe('Plugin', function () {

  it('is an object', () => {
    expect(typeof plugin).toBe('object');
  });

  it('has expected name', () => {
    expect(plugin).toHaveProperty('name', require('../package').name);
  });

  it('has expected hooks', () => {
    const expected = [
      'init',
      'metadata'
    ];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  it('registers the middleware lifecycle', async function () {
    const engine = setupEngine(path.join(__dirname, './fixtures/with-lifecycles'));

    await engine.exec('init');
    let called = false;
    proxy.once('middleware', function (gasket, app) {
      expect(gasket).toEqual(engine);
      expect(app).toEqual('testing');

      called = true;
    });

    await engine.exec('middleware', 'testing');

    expect(called).toBe(true);
  });

  it('allows for cjs file types', async function () {
    const engine = setupEngine(path.join(__dirname, './fixtures/with-cjs-lifecycles'));

    await engine.exec('init');
    let called = false;
    proxy.once('middleware', function (gasket, app) {
      expect(gasket).toEqual(engine);
      expect(app).toEqual('testing');

      called = true;
    });

    await engine.exec('middleware', 'testing');

    expect(called).toBe(true);
  });

  it('handles applications with no lifecycles directory', async () => {
    const engine = setupEngine(path.join(__dirname, './fixtures/without-lifecycles'));

    await engine.exec('init');
    await engine.exec('middleware', 'testing');
  });

  it('handles lifecycle files with timings specified', async () => {
    let called;
    const engine = setupEngine(path.join(__dirname, './fixtures/with-lifecycles'));

    await engine.exec('init');
    proxy.once('withTiming', function (gasket, arg) {
      expect(gasket).toEqual(engine);
      expect(arg).toEqual('testing');
      called = true;
    });

    await engine.exec('withTiming', 'testing');

    expect(called).toBe(true);
  });

  it('maps kebab-cased file names to camelCased event names', async () => {
    const engine = setupEngine(path.join(__dirname, './fixtures/kebab-cased'));
    await engine.exec('init');

    let called = false;
    proxy.once('someEvent', function (gasket, arg) {
      expect(gasket).toEqual(engine);
      expect(arg).toEqual('testing');
      called = true;
    });

    await engine.exec('someEvent', 'testing');
    expect(called).toBe(true);
  });

  it('skips *.test.js and *.spec.js files', async () => {
    const engine = setupEngine(path.join(__dirname, './fixtures/with-tests'));
    await engine.exec('init');

    let called = false;
    proxy.once('someEvent', function () {
      called = true;
    });

    await engine.exec('someEvent', 'testing');
    expect(called).toBe(false);

  });


  it('handles lifecycle files with src folder', async () => {
    const engine = setupEngine(path.join(__dirname, './fixtures/with-src-lifecycles'));
    await engine.exec('init');

    let called = false;
    proxy.once('middleware', function (gasket, app) {
      expect(gasket).toEqual(engine);
      expect(app).toEqual('testing');

      called = true;
    });

    await engine.exec('middleware', 'testing');

    expect(called).toBe(true);
  });
});
