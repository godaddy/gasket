const path = require('path');
const formatFilename = require('./format-filename');

const frontMatterConfig = {
  'README.md': {
    label: 'Overview',
    sidebar_position: 1,
    imports: ['import useBaseUrl from \'@docusaurus/useBaseUrl\';'],
    transforms: [{
      search: '"/site/static/img/logo-cover.svg"',
      replace: '{useBaseUrl(\'img/logo-cover.svg\')}'
    }]
  },
  'quick-start.md': {
    sidebar_position: 2
  },
  'lifecycle-graphs.md': {
    sidebar_position: 3
  },
  'create-gasket-app.md': {
    sidebar_position: 4
  },
  'typescript.md': {
    sidebar_position: 5
  },
  'upgrades.md': {
    sidebar_position: 6
  },
  'upgrade-to-6.md': {
    sidebar_position: 7
  },
  'CONTRIBUTING.md': {
    label: 'Contributing',
    sidebar_position: 8
  },
  'SECURITY.md': {
    label: 'Security',
    sidebar_position: 9
  },
  'LICENSE.md': {
    label: 'License',
    sidebar_position: 10
  }
};

/**
 * addFrontMatter - Add front matter to the content
 * @param {string} content The content of the file
 * @param {string} filename The name of the file
 * @returns {Object} The content with front matter & filename with possible extension change
 */
module.exports = function addFrontMatter(content, filename) {
  // File specific transforms
  if (frontMatterConfig[filename]?.transforms) {
    content = frontMatterConfig[filename].transforms.reduce((acc, transform) => {
      return acc.replace(transform.search, transform.replace);
    }, content);
  }

  // Front matter metadata
  // https://docusaurus.io/docs/markdown-features#front-matter
  const frontMatter = {
    title: `''`, // empty title to remove redundant title
    hide_title: true,
    sidebar_label: frontMatterConfig[filename]?.label || `${formatFilename(filename)}`,
    sidebar_position: frontMatterConfig[filename]?.sidebar_position || 50
  };

  const data = Object.entries(frontMatter).map(([key, value]) => `${key}: ${value}`).join('\n');
  const imports = frontMatterConfig[filename]?.imports
    ? `\n${frontMatterConfig[filename].imports.join('\n')}\n`
    : '';

  return {
    transformedContent: `---\n${data}\n---\n${imports}\n${content}`,
    file: `${path.parse(filename).name}.${imports ? 'mdx' : 'md'}`
  };
};

