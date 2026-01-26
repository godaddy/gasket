import path from 'path';
import formatFilename from '../utils/format-filename.js';
const isMarkdown = /\.md$/;

/**
 * txFixLinks - Fix links in markdown files
 * Change relative package links to the root docs
 */
const txFixLinks = {
  global: true,
  test: isMarkdown,
  handler: function fixLinks(content) {
    content = content
      .replace(/(\.\.\/)+plugins/g, '/docs/plugins')
      .replace(/(\.\.\/)+modules/g, '/docs/modules')
      .replace(/(\.\.\/)+plugin-/g, '/docs/plugins/plugin-')
      .replace(/packages\/gasket-plugin/g, '/docs/plugins/plugin')
      .replace(/\/@gasket\//g, '/')
      .replace(/#([a-z]+[A-Z].*)/g, (_, match) => '#' + match.toLowerCase());

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
      // eslint-disable-next-line no-nested-ternary
      sidebar_label: filename === 'README.md' ? `'@gasket/${label}'` :
        filename === 'EXAMPLES.md' ? `'Examples'` :
          `${formatFilename(filename.split('/').pop())}`
    };

    const data = Object.entries(frontMatter).map(([key, value]) => `${key}: ${value}`).join('\n');

    content = `---\n${data}\n---\n\n${content}`;

    return content;
  }
};

export default {
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
            'docs/**/*',
            'EXAMPLES.md'
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
