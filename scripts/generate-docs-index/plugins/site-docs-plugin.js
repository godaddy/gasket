const path = require('path');
const isMarkdown = /\.md$/;

function formatFilename(filename) {
  filename = `${filename.charAt(0).toUpperCase()}${filename.slice(1)}`;
  filename = filename.split('-').map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ');
  return filename.replace('.md', '');
}

const txFixLinks = {
  global: true,
  test: isMarkdown,
  handler: function fixLinks(content) {
    content = content
      .replace(/(\.\.\/)+plugins/g, '/docs/plugins')
      .replace(/(\.\.\/)+presets/g, '/docs/presets')
      .replace(/(\.\.\/)+modules/g, '/docs/modules')
      .replace(/(\.\.\/)+plugin-/g, '/docs/plugins/plugin-')
      .replace(/(\.\.\/)+preset-/g, '/docs/presets/preset-')
      .replace(/packages\/gasket-plugin/g, '/docs/plugins/plugin')
      .replace(/\/@gasket\//g, '/');

    return content;
  }
}

const txFixLicenseLinks = {
  global: true,
  test: isMarkdown,
  handler: function fixLinks(content, { docsConfig }) {
    const { targetRoot } = docsConfig;
    const relativePath = targetRoot.split('/docs/')[1].replace('@gasket/', '').split('/').map(() => '..').join('/');
    return content.replace(/\.\/LICENSE.md/g, `${relativePath}/LICENSE.md`);
  }
};

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

    content = `---\n${data}\n---\n\n${content}`

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
            'docs/**/*',
            'docs/*'
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
}
