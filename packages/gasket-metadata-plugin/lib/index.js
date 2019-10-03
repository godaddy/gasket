const cloneDeep = require('lodash.clonedeep');
const isObject = require('lodash.isobject');
const { pluginIdentifier, presetIdentifier } = require('@gasket/resolve');
const { sanitize, expand } = require('./utils');

const isPlugin = name => pluginIdentifier.isValidFullName(name);
const isPreset = name => presetIdentifier.isValidFullName(name);

//
// Add moduleData for app dependencies
//
function loadAppModules(loader, metadata) {
  const { app, modules } = metadata;
  Object.keys(app.package.dependencies)
    .filter(name => !isPlugin(name) && !isPreset(name))
    .forEach(name => {
      const range = app.package.dependencies[name];
      const moduleInfo = loader.getModuleInfo(null, name, { from: app.name, range });
      modules.push(moduleInfo);
    });
}

//
// load moduleInfo for any supporting modules that are declared
//
function loadPluginModules(loader, plugins) {
  plugins.forEach(pluginData => {
    if (pluginData.modules) {
      pluginData.modules = pluginData.modules
        .map(mod => isObject(mod) ? mod : { name: mod })  // normalize string names to objects
        .map(mod => loader.getModuleInfo(null, mod.name, mod));
    }
  });
}

//
// flatten moduleData from plugin
//
function flattenPluginModules(metadata){
  const { plugins, modules } = metadata;
  plugins.reduce((acc, pluginData) => {
    if (pluginData.modules) {
      pluginData.modules.forEach(moduleData => {
        const existing = acc.find(mod => mod.name === moduleData.name);
        if (existing) {
          expand(existing, moduleData);
        } else {
          acc.push(moduleData);
        }
      });
    }
  }, modules);
}


//
// assign plugin instances back to preset hierarchy to avoid faulty data
//
function fixupHierarchy(metadata) {
  const { plugins, presets } = metadata;

  plugins.forEach(pluginData => {
    function checkPreset(presetData) {
      if (presetData.name === pluginData.from) {
        const idx = presetData.plugins.findIndex(p => p.name === pluginData.name);
        presetData.plugins[idx] = pluginData;
      }
      presetData.presets && presetData.presets.forEach(checkPreset);
    }

    presets.forEach(checkPreset);
  });
}

module.exports = {
  name: 'metadata',
  hooks: {
    async init(gasket) {
      const { loader, config } = gasket;
      const { root = process.cwd() } = config;
      const loaded = loader.loadConfigured(config.plugins);
      const { presets, plugins } = sanitize(cloneDeep(loaded));
      const app = loader.getModuleInfo(null, root);

      /**
       * @type {Metadata}
       */
      gasket.metadata = {
        app,
        presets,
        plugins,
        modules: []
      };

      loadAppModules(loader, gasket.metadata);

      //
      // Allow plugins to tune their own metadata via lifecycle
      //
      await gasket.execApply('metadata', async ({ name }, handler) => {
        const idx = plugins.findIndex(p => p.module.name === name || p.name === name);
        const pluginData = plugins[idx];
        // eslint-disable-next-line require-atomic-updates
        plugins[idx] = await handler(pluginData);
      });

      loadPluginModules(loader, gasket.metadata.plugins);
      flattenPluginModules(gasket.metadata);
      fixupHierarchy(gasket.metadata);
    },
    metadata(gasket, pluginData) {
      return {
        ...pluginData,
        lifecycles: [{
          name: 'metadata',
          method: 'execApply',
          description: 'Allows plugins to adjust their metadata',
          link: 'README.md#metadata'
        }]
      };
    }
  }
};
