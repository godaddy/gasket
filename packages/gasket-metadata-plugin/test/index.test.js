const plugin = require('../');
const assume = require('assume');
const { stub } = require('sinon');
const path = require('path');

describe('Metadata plugin', function () {
  let gasket, applyStub, handlerStub;
  beforeEach(function () {
    applyStub = stub();
    handlerStub = stub();

    gasket = {
      resolver: {
        tryResolvePluginRelativePath: plugin => path.join(__dirname, 'fixtures', plugin)
      },
      _plugins: {},
      config: {
        metadata: {
          plugins: {}
        }
      },
      execApply: async (event, fn) => {
        await applyStub(event);
        await fn({ name: 'thingy' }, () => {
          handlerStub();
          return 'a book please';
        });
      }
    };
  });

  it('is named correctly', function () {
    assume(plugin.name).equals('metadata');
  });

  it('has an init hook', function () {
    assume(plugin.hooks.init).exists();
  })

  it('gathers the package.json for each given plugin', async function () {
    gasket._plugins = {
      'bird': 'larry'
    };
    await plugin.hooks.init(gasket);

    assume(gasket.config.metadata.plugins.bird.name).equals('@gasket/bird-plugin');
  });

  it('gathers the hooks for each given plugin', async function () {
    gasket._plugins = {
      'bird': 'larry'
    };
    await plugin.hooks.init(gasket);

    assume(Object.keys(gasket.config.metadata.plugins.bird.hooks)).has.length(4);
    assume(gasket.config.metadata.plugins.bird.hooks.exists()).equals(false);
  });

  it('executes the metadata lifecycle', async function () {
    await plugin.hooks.init(gasket);
    assume(applyStub.calledOnce).is.true();
  });

  it('augments the metadata with data from the lifecycle hooks', async function () {
    gasket._plugins = {
      'bird': 'bar'
    };
    await plugin.hooks.init(gasket);
    assume(handlerStub.calledOnce).is.true();
    assume(gasket.config.metadata.plugins.thingy).equals("a book please");
  });
});
