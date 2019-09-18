const plugin = require('../');
const assume = require('assume');
const sinon = require('sinon');

const mockPlugin = {
  name: 'mock',
  hooks: {
    metadata: (gasket, metadata) => {
      return {
        ...metadata,
        modified: true
      };
    }
  }
};

const mockPluginInfo = {
  name: '@gasket/mock-plugin',
  module: mockPlugin,
  from: '@gasket/mock-preset'
};

const mockPresetInfo = {
  name: '@gasket/mock-preset',
  module: {},
  plugins: [mockPluginInfo]
};

const mockLoadedData = {
  presets: [mockPresetInfo],
  plugins: [mockPluginInfo]
};

describe('Docs plugin', function () {
  let gasket, applyStub, handlerStub;

  beforeEach(function () {
    applyStub = sinon.stub();
    handlerStub = sinon.stub();

    gasket = {
      loader: {
        loadConfigured: sinon.stub().returns(mockLoadedData)
      },
      config: {
        plugins: {
          presets: ['mock']
        }
      },
      execApply: async (event, fn) => {
        await applyStub(event);
        await fn({ name: 'mock' }, (meta) => {
          handlerStub(meta);
          return mockPlugin.hooks.metadata(gasket, meta);
        });
      }
    };
  });

  it('is named correctly', function () {
    assume(plugin.name).equals('docs');
  });
});
