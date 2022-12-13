const defaultsDeep = require('lodash.defaultsdeep');
const generateContent = require('./generate-content');
const { requireWithInstall } = require('@gasket/utils');

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
  const { serve } = await requireWithInstall('docsify-cli/lib', gasket);
  const userConfig = gasket.config.docsify || {};
  const docsifyConfig = defaultsDeep({}, userConfig, defaultConfig);
  const { port } = docsifyConfig;
  const { docsRoot } = docsConfigSet;

  await generateContent(docsifyConfig, docsConfigSet);

  serve(docsRoot, true, port);
};
