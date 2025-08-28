import path from 'path';
import formatFilename from './format-filename.js';

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
  'create-gasket-app.md': {
    sidebar_position: 3
  },
  'gasket-actions.md': {
    sidebar_position: 4
  },
  'typescript.md': {
    sidebar_position: 5
  },
  'upgrades.md': {
    sidebar_position: 6
  },
  'upgrade-to-6.md': {
    unlisted: true
  },
  'upgrade-to-7.md': {
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
  },
  'EXAMPLES.md': {
    label: 'Examples',
    sidebar_position: 50
  }
};

/**
 * addFrontMatter - Add front matter to the content
 * @param {string} content The content of the file
 * @param {string} filename The name of the file
 * @returns {object} The content with front matter & filename with possible extension change
 */
export default function addFrontMatter(content, filename) {
  // File specific transforms
  if (frontMatterConfig[filename]?.transforms) {
    content = frontMatterConfig[filename].transforms.reduce((acc, transform) => {
      return acc.replace(transform.search, transform.replace);
    }, content);
  }

  // Front matter metadata
  // https://docusaurus.io/docs/markdown-features#front-matter
  const config = frontMatterConfig[filename];

  const frontMatter = {
    title: `''`, // empty title to remove redundant title
    hide_title: true,
    unlisted: config?.unlisted || false, // ability to hide from sidebar
    sidebar_label: config?.label || `${formatFilename(filename)}`,
    sidebar_position: config?.sidebar_position || 50
  };

  const data = Object.entries(frontMatter).map(([key, value]) => {
    // Quote string values that aren't already quoted
    if (typeof value === 'string' && !value.startsWith("'") && !value.startsWith('"')) {
      value = `'${value}'`;
    }
    return `${key}: ${value}`;
  }).join('\n');
  const imports = frontMatterConfig[filename]?.imports
    ? `\n${frontMatterConfig[filename].imports.join('\n')}\n`
    : '';

  return {
    transformedContent: `---\n${data}\n---\n${imports}\n${content}`,
    file: `${path.parse(filename).name}.${imports ? 'mdx' : 'md'}`
  };
}

