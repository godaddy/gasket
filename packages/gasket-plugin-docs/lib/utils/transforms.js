/* eslint-disable max-params */

const path = require('path');

const isGasketScope = /^@gasket/;
const isMarkdown = /\.md$/;
const matchLink = /(]\s?:\s?|]\()([^)\s]+)(\)|\s?)/g;
const matchUrlLink = /^https:\/\/github.com\/godaddy\/gasket\/tree\/[^/]+\/packages\/(gasket-[^/]+)(\/.+)/;

/**
 * Creates transform to modify links in markdown files
 *
 * @param {function(string): string} callback - Takes a link and returns modified link
 * @returns {function(string): string} thunk that transforms content
 */
const makeLinkTransform = callback => content => {
  return content.replace(matchLink, (match, p1, p2, p3) => {
    return [p1, callback(p2) || p2, p3].join('');
  });
};

/**
 * Updates gasket monorepo /packages/* links to be URLs to repo.
 *
 * @type {DocsTransform}
 */
const txGasketPackageLinks = {
  global: true,
  test: /(node_modules\/@gasket|packages\/gasket-.+)\/.+\.md$/,
  /**
   * @type {DocsTransformHandler}
   * @param {string} content - Markdown content
   * @param {DocsConfigSet} docsConfigSet - Full config set for reference
   * @returns {string} transformed content
   */
  handler: function txGasketPackageLinks(content, { docsConfig }) {
    // safety check that this is a @gasket scoped package.
    if (!isGasketScope.test(docsConfig.name)) return content;

    const tx = makeLinkTransform(link => {
      if (/^\/packages\/gasket-.+/.test(link)) {
        return ['https://github.com/godaddy/gasket/tree/main', link].join('');
      }
    });

    return tx(content);
  }
};

/**
 * Updates all gasket URL links to be relative to the collated docs
 * if the target package has a docsConfig.
 *
 * @type {DocsTransform}
 */
const txGasketUrlLinks = {
  global: true,
  test: isMarkdown,
  /**
   * @type {DocsTransformHandler}
   * @param {string} content - Markdown content
   * @param {ModuleDocsConfig} docsConfig - Module's docConfig
   * @param {DocsConfigSet} docsConfigSet - Full config set for reference
   * @returns {string} transformed content
   */
  handler: function txGasketUrlLinks(content, { filename, docsConfig, docsConfigSet }) {
    const { targetRoot } = docsConfig;
    const { modules, presets, plugins } = docsConfigSet;
    const allModuleDocConfigs = modules.concat(plugins).concat(presets);

    const tx = makeLinkTransform(link => {
      return link.replace(matchUrlLink, (match, pkgMatch, fileMatch) => {
        const moduleName = pkgMatch.replace('gasket-', '@gasket/');
        const tgtDocConfig = allModuleDocConfigs.find(m => m.name === moduleName);
        if (tgtDocConfig) {
          const dirWithLinkRef = path.dirname(path.join(targetRoot, filename));
          const filePathOfLink = path.join(tgtDocConfig.targetRoot, fileMatch);
          return path.relative(dirWithLinkRef, filePathOfLink);
        }
        return match;
      });
    });

    return tx(content);
  }
};

/**
 * Updates any absolute links in collated packages to be relative to the
 * markdown file itself.
 *
 * @type {DocsTransform}
 */
const txAbsoluteLinks = {
  global: true,
  test: isMarkdown,
  /**
   * @type {DocsTransformHandler}
   * @param {string} content - Markdown content
   * @param {string} filename - Relative package filename
   * @param {ModuleDocsConfig} docsConfig - Docs config for this file's module
   * @returns {string} transformed content
   */
  handler: function txAbsoluteLinks(content, { filename, docsConfig }) {
    const { targetRoot } = docsConfig;
    const dirname = path.dirname(path.join(targetRoot, filename));

    const tx = makeLinkTransform(link => {
      return link.replace(/(^\/.+)(#.+)/, (match, p1, p2) => {
        const linkTarget = path.join(targetRoot, p1);
        const relLink = path.relative(dirname, linkTarget);
        return [relLink, p2].join('');
      });
    });

    return tx(content);
  }
};

module.exports = {
  makeLinkTransform,
  txGasketPackageLinks,
  txGasketUrlLinks,
  txAbsoluteLinks
};
