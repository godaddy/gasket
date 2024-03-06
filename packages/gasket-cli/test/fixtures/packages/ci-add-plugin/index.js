module.exports = {
  name: 'ci-add',
  hooks: {
    prompt: async function (gasket, context, { addPlugins }) {
      const pluginPath = __dirname.replace('ci-add', 'ci-extra');
      await addPlugins(`@gasket/plugin-ci-extra@file:${pluginPath}`);

      return context;
    }
  }
};
