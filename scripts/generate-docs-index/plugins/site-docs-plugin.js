const path = require('path');
const isMarkdown = /\.md$/;
const formatFilename = require('../utils/format-filename');

/**
 * txFixLinks - Fix links in markdown files
 * Change relative package links to the root docs
 */
const txFixLinks = {
  global: true,
  test: isMarkdown,
  handler: function fixLinks(content) {
    content = content
      .replace(/(\.\.\/)+plugins/g, '/docs/Plugins')
      .replace(/(\.\.\/)+presets/g, '/docs/Presets')
      .replace(/(\.\.\/)+modules/g, '/docs/Modules')
      .replace(/(\.\.\/)+plugin-/g, '/docs/Plugins/plugin-')
      .replace(/(\.\.\/)+preset-/g, '/docs/Presets/preset-')
      .replace(/packages\/gasket-plugin/g, '/docs/Plugins/plugin')
      .replace(/\/@gasket\//g, '/');

    return content;
  }
};

/**
 * txFixLicenseLinks - Fix license links
 * Change relative package links to the root LICENSE.md
 */
const txFixLicenseLinks = {
  global: true,
  test: isMarkdown,
  handler: function fixLinks(content, { docsConfig }) {
    const { targetRoot } = docsConfig;
    const relativePath = targetRoot.split('/docs/')[1].replace('@gasket/', '').split('/').map(() => '..').join('/');
    return content.replace(/\.\/LICENSE.md/g, `${relativePath}/LICENSE.md`);
  }
};

/**
 * txFrontMatter - Add front matter to markdown files
 * https://docusaurus.io/docs/markdown-features#front-matter
 */
const txFrontMatter = {
  global: true,
  test: isMarkdown,
  handler: function txFrontMatter(content, { filename, docsConfig }) {
    const { targetRoot } = docsConfig;
    const label = path.basename(targetRoot);

    const frontMatter = {
      title: `''`,
      hide_title: true,
      sidebar_label: filename === 'README.md' ? `'@gasket/${label}'` : `${formatFilename(filename.split('/').pop())}`
    };

    const data = Object.entries(frontMatter).map(([key, value]) => `${key}: ${value}`).join('\n');

    content = `---\n${data}\n---\n\n${content}`;

    return content;
  }
};

module.exports = {
  name: 'site-docs-plugin',
  hooks: {
    docsSetup: {
      timing: {
        after: ['@gasket/plugin-docs']
      },
      handler: () => {
        return {
          files: [
            'README.md',
            'docs/**/*'
          ],
          transforms: [
            txFrontMatter,
            txFixLicenseLinks,
            txFixLinks
          ]
        };
      }
    }
  }
};
