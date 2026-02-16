import path from 'path';

const isGasketScope = /^@gasket/;
const isMarkdown = /\.md$/;
const matchLink = /(]\s?:\s?|]\()([^)\s]+)(\)|\s?)/g;
const matchUrlLink =
  /^https:\/\/github.com\/godaddy\/gasket\/tree\/[^/]+\/packages\/(gasket-[^/]+)(\/.+)/;

/**
 * Creates transform to modify links in markdown files
 * @type {import('../internal.d.ts').LinkTransform}
 */
const makeLinkTransform = (callback) => (content) => {
  return content.replace(matchLink, (match, p1, p2, p3) => {
    return [p1, callback(p2) || p2, p3].join('');
  });
};

/**
 * Updates gasket monorepo /packages/* links to be URLs to repo.
 * @type {import('../internal.d.ts').DocsTransform}
 */
const txGasketPackageLinks = {
  global: true,
  test: /(node_modules\/@gasket|packages\/gasket-.+)\/.+\.md$/,
  handler: function txGasketPackageLinks(content, { docsConfig }) {
    // safety check that this is a @gasket scoped package.
    if (!isGasketScope.test(docsConfig.name)) return content;

    const tx = makeLinkTransform((link) => {
      if (/^\/packages\/gasket-.+/.test(link)) {
        return ['https://github.com/godaddy/gasket/tree/main', link].join('');
      }
    });

    return tx(content);
  }
};

/**
 * Updates all gasket URL links to be relative to the collated docs if the
 * target package has a docsConfig.
 * @type {import('../internal.d.ts').DocsTransform}
 */
const txGasketUrlLinks = {
  global: true,
  test: isMarkdown,
  /** @type {import('../internal.d.ts').DocsTransformHandler} */
  handler: function txGasketUrlLinks(
    content,
    { filename, docsConfig, docsConfigSet }
  ) {
    const { targetRoot } = docsConfig;
    const { modules, presets, plugins } = docsConfigSet;
    const allModuleDocConfigs = modules.concat(plugins).concat(presets);

    const tx = makeLinkTransform((link) => {
      return link.replace(matchUrlLink, (match, pkgMatch, fileMatch) => {
        const moduleName = pkgMatch.replace('gasket-', '@gasket/');
        const tgtDocConfig = allModuleDocConfigs.find(function (m) {
          if (typeof m === 'object') {
            return m.name === moduleName;
          }
        });

        if (tgtDocConfig) {
          const dirWithLinkRef = path.dirname(path.join(targetRoot, filename));
          const targetRootConfig =
            typeof tgtDocConfig === 'object'
              ? tgtDocConfig.targetRoot
              : tgtDocConfig;
          const filePathOfLink = path.join(targetRootConfig, fileMatch);
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
 * @type {import('../internal.d.ts').DocsTransform}
 */
const txAbsoluteLinks = {
  global: true,
  test: isMarkdown,
  handler: function txAbsoluteLinks(content, { filename, docsConfig }) {
    const { targetRoot } = docsConfig;
    const dirName = path.dirname(path.join(targetRoot, filename));

    const tx = makeLinkTransform((link) => {
      return link.replace(/(^\/.+)(#.+)/, (match, p1, p2) => {
        const linkTarget = path.join(targetRoot, p1);
        const relLink = path.relative(dirName, linkTarget);
        return [relLink, p2].join('');
      });
    });

    return tx(content);
  }
};

export {
  makeLinkTransform,
  txGasketPackageLinks,
  txGasketUrlLinks,
  txAbsoluteLinks
};
