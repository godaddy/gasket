const Engine = require('@gasket/plugin-engine');
const { it, describe } = require('mocha');
const assume = require('assume');

const core = require('../../index');

describe('@gasket/core-plugin', function () {
  let engine;
  let servers;

  this.timeout(60000);

  async function setup(plugins = []) {
    engine = new Engine({
      root: '/some/path',
      plugins: {
        add: [core, 'log', 'nextjs', 'webpack', 'express', ...plugins].filter(Boolean)
      },
      next: {},
      express: {
        excludedRoutesRegex: /^(?!\/_next\/)/
      },
      http: {
        port: 8111
      }
    });

    await engine.exec('init');
    engine.config = await engine.execWaterfall('configure', engine.config);
    await engine.exec('build');
  }

  afterEach(async function () {
    if (!servers) return;

    servers.filter(Boolean).forEach(async function each(kill) {
      await kill();
    });

    servers = null;
  });

  it('is exported in plugin format', async function () {
    await setup();

    assume(core).is.a('object');
    assume(core.hooks).is.a('object');
    assume(core.hooks.start).is.a('asyncfunction');
  });

  describe('lifecycle: start', function () {
    it('returns a promise that destroys started servers', async function () {
      await setup();

      servers = await engine.exec('start');

      assume(servers).is.a('array');
    });

    describe('next', function () {
      it('it executes the `next` lifecycle', async function () {
        let called = false;

        await setup([{
          name: 'test',
          hooks: {
            next: function (gasket, next) {
              assume(gasket).is.a('object');
              assume(next.buildId).is.a('string');

              called = true;
            }
          }
        }]);

        servers = await engine.exec('start');

        assume(called).is.true();
      });
    });

    describe('ssr', function () {
      it('it executes the `ssr` lifecycle', async function () {
        let called = false;

        await setup([{
          name: 'test',
          hooks: {
            ssr: function (gasket, { next, express }) {
              assume(gasket).is.a('object');
              assume(next.buildId).is.a('string');
              assume(express.use).is.a('function');
              assume(express.get('buildId')).equals(next.buildId);

              called = true;
            }
          }
        }]);

        servers = await engine.exec('start');

        assume(called).is.true();
      });
    });

    describe('express', function () {
      it('executes the `express` lifecycle', async function () {
        let called = false;

        await setup([{
          name: 'test',
          hooks: {
            express: function (gasket, express) {
              assume(gasket).is.a('object');
              assume(express.use).is.a('function');

              called = true;
            }
          }
        }]);

        servers = await engine.exec('start');

        assume(called).is.true();
      });

      it('executes the `middleware` lifecycle', async function () {
        function middleware() {}
        let app;

        await setup([{
          name: 'test',
          hooks: {
            middleware: function (gasket, express) {
              app = express;
              return middleware;
            }
          }
        }]);

        servers = await engine.exec('start');
        const matches = app._router.stack.filter(f => f.handle === middleware);

        assume(matches).is.length(1);
      });

      it('merges all returned middleware', async function () {
        const layers = [function one() {}, function two() {}];
        let app;

        await setup([{
          name: 'test',
          hooks: {
            middleware: function (gasket, express) {
              app = express;
              return layers;
            }
          }
        }]);

        servers = await engine.exec('start');

        layers.forEach((middleware) => {
          const matches = app._router.stack.filter(f => f.handle === middleware);
          assume(matches).is.length(1);
        });
      });
    });
  });
});
