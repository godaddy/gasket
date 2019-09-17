/* eslint-disable max-params */

const path = require('path');

const isGasketScope = /^@gasket/;
const isAbsolutePackageLink = /(]\s?:\s?|]\()(\/packages\/)(gasket-.+)(\/.+)/g;
const isRepoUrlLink = /(]\s?:\s?|]\()(https:\/\/github.com\/godaddy\/gasket\/tree\/.+\/packages\/)(gasket-.+)(\/.+)/g;

/**
 * Updates gasket monorepo links to be relative to the collocated docs,
 * or otherwise URLs to repo if the target package was not collocated.
 *
 * @type {DocsTransform}
 */
const txGasketLinks = {
  global: true,
  test: /(node_modules\/@gasket|packages\/gasket-.+)\/.+\.md$/,
  /**
   * @param {string} content - Markdown content
   * @param {ModuleDocsConfig} docsConfig - Module's docConfig
   * @param {DocsConfigSet} docsConfigSet - Full config set for reference
   * @returns {string} transformed content
   */
  handler: (content, { docsConfig, docsConfigSet }) => {
    //
    // safety check that this is a @gasket scoped package, or exit early.
    //
    if (isGasketScope.test(docsConfig.name)) return content;

    //
    // normalize all relative /packages links back to repo urls
    //
    content = content.replace(isAbsolutePackageLink, (match, p1, p2, p3, p4) => {
      return [p1, 'https://github.com/godaddy/gasket/tree/master/packages/', p3, p4].join('');
    });

    const { modules, presets, plugins, docsRoot } = docsConfigSet;
    const allModules = modules.concat(plugins).concat(presets);
    //
    // for any packages that have been collocated, make relative links, otherwise leave as github urls
    //
    content = content.replace(isRepoUrlLink, (match, p1, p2, p3, p4) => {
      const modName = p3.replace('gasket-', '@gasket/');
      const tgtDoc = allModules.find(m => m.name === modName);
      if (tgtDoc) {
        const relRoot = path.relative(docsRoot, tgtDoc.targetRoot);
        return [p1, relRoot, p4].join('');
      }
      return match;
    });
    return content;
  }
};

/**
 * Updates any absolute links in collocated packages to be relative to the
 * package itself.
 *
 * @type {DocsTransform}
 */
const txPackageLinks = {
  global: true,
  test: /\.md$/,
  handler: (content, { docsConfig }) => {
    // TODO
    return content;
  }
};

/**
 * Specify what files to copy and transform
 *
 * @returns {DocsSetup} docsSetup
 */

module.exports = function docs() {
  return {
    link: 'README.md',
    files: [
      'README.md',
      'CHANGELOG.md',
      'docs/**/*',
      'more-docs/**/*'
    ],
    transforms: [
      txGasketLinks,
      txPackageLinks
    ]
  };
};
