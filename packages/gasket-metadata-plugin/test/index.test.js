const plugin = require('../');
const assume = require('assume');
const sinon = require('sinon');
const path = require('path');

describe('Metadata plugin', function () {
  let gasket, applyStub;
  beforeEach(function () {
    applyStub = sinon.stub();

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
        await fn({}, () => {});
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
      'foo': 'bar'
    };

    await plugin.hooks.init(gasket);
    assume(gasket.config.metadata.plugins.foo.name).equals('@gasket/foo-plugin');
  });
  it('gathers the hooks for each given plugin');
  it('executes the metadata lifecycle');
  it('augments the metadata with data from the lifecycle hooks');
});
