const proxyquire = require('proxyquire');
const assume = require('assume');
const sinon = require('sinon');
const path = require('path');

describe('Metadata plugin', function () {
  let plugin, gasket, applyStub;
  beforeEach(function () {
    plugin = proxyquire('./', {

    });

    applyStub = sinon.stub();

    gasket = {
      resolver: {
        tryResolvePluginRelativePath: path.resolve
      },
      _plugins: {},
      execApply: async (event, fn) => {
        await applyStub(event);
        await fn();
      }
    };
  });

  it('gathers the package.json for each given plugin');
  it('executes the metadata lifecycle');
  it('augments the metadata with data from the lifecycle hooks');
});
