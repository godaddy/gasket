const defaultsDeep = require('lodash.defaultsdeep');
const { serve } = require('docsify-cli/lib');
const generateContent = require('./generate-content');

const defaultConfig = {
  theme: 'styles/gasket.css',
  port: 3000,
  config: {
    nameLink: '#/',
    auto2top: true,
    relativePath: true,
    maxLevel: 3
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
