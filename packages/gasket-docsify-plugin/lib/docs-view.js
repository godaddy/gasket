const defaultsDeep = require('lodash.defaultsdeep');
const { serve } = require('docsify-cli/lib');
const generateContent = require('./generate-content');

const defaultConfig = {
  theme: 'vue',
  port: 3000,
  config: {
    auto2top: true,
    relativePath: true
  }
};

module.exports = async function docsView(gasket, docsConfigSet) {
  const userConfig = gasket.config.docsify || {};
  const docsifyConfig = defaultsDeep({}, userConfig, defaultConfig);
  const { port } = docsifyConfig;
  const { docsRoot } = docsConfigSet;

  await generateContent(docsifyConfig, docsConfigSet);

  serve(docsRoot, true, port);
};
