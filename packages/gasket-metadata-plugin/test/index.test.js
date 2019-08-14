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
        tryResolvePluginRelativePath: name => path.join(__dirname, 'fixtures', name)
      },
      _plugins: {},
      config: {
        root: 'Quest',
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
  });

  it('gathers the package.json for each given plugin', async function () {
    gasket._plugins = {
      bird: 'larry'
    };
    await plugin.hooks.init(gasket);

    assume(gasket.config.metadata.plugins.bird.name).equals('@gasket/bird-plugin');
  });

  it('gathers the hooks for each given plugin', async function () {
    gasket._plugins = {
      bird: 'larry'
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
      bird: 'law'
    };
    await plugin.hooks.init(gasket);
    assume(handlerStub.calledOnce).is.true();
    assume(gasket.config.metadata.plugins.thingy).equals('a book please');
  });

  it('does not add metadata for a built-in plugin', async function () {
    gasket._plugins = {
      Questionnaire: 'Does this work?',
      Questlove: 'Because it shouldn\'t',
      Question: 'Like at all',
      bird: 'plz kill, regardless of the cost in stones'
    };
    await plugin.hooks.init(gasket);
    assume(gasket.config.metadata.plugins.Questionnaire).does.not.exist();
    assume(gasket.config.metadata.plugins.Questlove).does.not.exist();
    assume(gasket.config.metadata.plugins.Question).does.not.exist();
  });
});
