# @gasket/plugin-docs Examples

This document provides working examples for all exported interfaces and functionality from `@gasket/plugin-docs`.

## Plugin Installation and Usage

### Basic Plugin Setup

```javascript
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginDocs from '@gasket/plugin-docs';

export default makeGasket({
  plugins: [
    pluginDocs
  ],
  docs: {
    outputDir: '.docs' // Default
  }
});
```

## Lifecycle Hooks

### docsSetup Hook

Configure what documentation files to capture and how to transform them.

```javascript
// my-plugin.js
export default {
  name: 'my-plugin',
  hooks: {
    docsSetup(gasket, { defaults }) {
      return {
        link: 'README.md',
        files: [
          'README.md',
          'docs/**/*.md',
          'CONTRIBUTING.md'
        ],
        transforms: [
          {
            test: /\.md$/,
            handler: (content, { filename }) => {
              // Transform markdown content
              return content.replace(/TODO/g, '**TODO**');
            }
          }
        ],
        modules: {
          'some-dependency': {
            link: 'README.md',
            files: ['docs/**/*.md']
          }
        }
      };
    }
  }
};
```

### docsView Hook

View the collated documentation after generation.

```javascript
// my-docs-viewer-plugin.js
import { spawn } from 'child_process';

export default {
  name: 'my-docs-viewer',
  hooks: {
    docsView(gasket, docsConfigSet) {
      const { docsRoot } = docsConfigSet;
      console.log(`Opening docs at: ${docsRoot}`);

      // Open docs with system default
      spawn('open', [docsRoot], { stdio: 'inherit' });
    }
  }
};
```

### docsGenerate Hook

Generate additional documentation content.

```javascript
// my-docs-generator-plugin.js
import { writeFile } from 'fs/promises';
import path from 'path';

export default {
  name: 'my-docs-generator',
  hooks: {
    async docsGenerate(gasket, docsConfigSet) {
      const { docsRoot } = docsConfigSet;

      // Generate a custom guide
      const guideContent = `# Custom Guide\n\nThis is generated content.`;
      const guidePath = path.join(docsRoot, 'CUSTOM_GUIDE.md');

      await writeFile(guidePath, guideContent);

      return {
        name: 'Custom Guide',
        description: 'A dynamically generated guide',
        link: 'CUSTOM_GUIDE.md',
        targetRoot: docsRoot
      };
    }
  }
};
```

## Transform Examples

### Content Transform

```javascript
// transforms/content-transform.js
export const codeBlockTransform = {
  test: /\.md$/,
  handler: (content, { filename }) => {
    // Add filename to code blocks
    return content.replace(
      /```(\w+)\n/g,
      `\`\`\`$1\n// File: ${filename}\n`
    );
  }
};
```

### Global Transform

```javascript
// transforms/global-transform.js
export const globalBrandingTransform = {
  global: true, // Applies to all modules
  test: /\.md$/,
  handler: (content) => {
    return content.replace(
      /# ([^\n]+)/g,
      '# $1\n\n> Part of the MyCompany Documentation'
    );
  }
};
```

## Command Usage

### Basic docs command

```bash
# Generate documentation
npm run docs

# Generate docs without opening viewer
node gasket.js docs --no-view
```
