const { it, describe } = require('mocha');
const { lifecycle } = require('./');
const assume = require('assume');

describe('lifecycle: build', function () {
  //
  // Bump the timeout as certain tests also execute the nextjs build process
  // which starts webpack.
  //
  this.timeout(60000);

  it('executes the `webpackChain` lifecycle', async function () {
    let called = false;
    const engine = lifecycle({ example: 1 }, {
      webpackChain: function (gasket, chain, data) {
        assume(gasket).equals(engine);
        assume(chain).is.a('object');
        assume(data).is.a('object');
        assume(data.isServer).is.a('boolean');

        called = true;
      }
    });

    await engine.exec('build');
    assume(called).is.true();
  });

  it('executes the `webpack` lifecycle', async function () {
    let called = false;
    const engine = lifecycle({ example: 3 }, {
      webpack: function (gasket, webpackConfig, data) {
        assume(gasket).equals(engine);
        assume(webpackConfig).is.a('object');
        assume(data).is.a('object');
        assume(data.isServer).is.a('boolean');

        called = true;
      }
    });

    await engine.exec('build');
    assume(called).is.true();
  });

  it('the `webpack` lifecycle receives the result of `webpackChain`', async function () {
    let called = false;
    const engine = lifecycle({ example: 4 }, {
      webpackChain: function (gasket, chain) {
        chain.resolve.alias.set('@gx/example', __filename);
      },
      webpack: function (gasket, webpackConfig) {
        assume(gasket).equals(engine);
        assume(webpackConfig.resolve.alias['@gx/example']).equals(__filename);

        called = true;
      }
    });

    await engine.exec('build');
    assume(called).is.true();
  });
});
