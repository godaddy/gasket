# Gasket Vite Integration Guide

This guide outlines the changes needed to support Vite apps alongside Next.js apps in the Gasket framework.

## Overview

To support Vite apps, we need to create new packages and modify existing ones following Gasket's plugin architecture. The changes maintain backward compatibility while adding new capabilities.

## Required Changes

### 1. Create `@gasket/plugin-vite` Package

Create a new plugin package at `packages/gasket-plugin-vite/` with the following structure:

```
packages/gasket-plugin-vite/
├── package.json
├── lib/
│   ├── index.js          # Main plugin file
│   ├── index.d.ts        # TypeScript definitions
│   ├── prompt.js         # Vite-specific prompts
│   ├── create.js         # File generation logic
│   ├── configure.js      # Vite configuration
│   ├── actions.js        # Plugin actions
│   └── metadata.js       # Plugin metadata
├── generator/
│   ├── app/
│   │   ├── react/        # React templates
│   │   ├── vue/          # Vue templates
│   │   └── vanilla/      # Vanilla JS templates
│   ├── vite/
│   │   └── vite.config.js
│   └── markdown/
│       └── vite-guide.md
└── test/

```

**Example `lib/index.js`:**
```javascript
const { name, version, description } = require('../package.json');
const prompt = require('./prompt');
const create = require('./create');
const configure = require('./configure');
const actions = require('./actions');
const metadata = require('./metadata');

module.exports = {
  name,
  version,
  description,
  actions,
  hooks: {
    prompt,
    create,
    configure,
    metadata,
    // Vite-specific hooks
    viteConfig: async (gasket, viteConfig) => viteConfig,
    viteServe: async (gasket, server) => { /* Dev server hooks */ },
    viteBuild: async (gasket, config) => { /* Build hooks */ }
  }
};
```

**Example `lib/prompt.js`:**
```javascript
module.exports = {
  timing: {
    before: ['@gasket/plugin-typescript']
  },
  handler: async function promptVite(gasket, context, { prompt }) {
    if (context.useVite !== true) return context;

    const { viteFramework } = await prompt([
      {
        name: 'viteFramework',
        message: 'Which framework would you like to use with Vite?',
        type: 'list',
        choices: [
          { name: 'React', value: 'react' },
          { name: 'Vue 3', value: 'vue' },
          { name: 'Vanilla JavaScript', value: 'vanilla' }
        ]
      }
    ]);

    const { viteSsr } = await prompt([
      {
        name: 'viteSsr',
        message: 'Would you like to enable Server-Side Rendering (SSR)?',
        type: 'confirm',
        default: false
      }
    ]);

    return { ...context, viteFramework, viteSsr };
  }
};
```

**Example `lib/create.js`:**
```javascript
module.exports = {
  timing: {
    before: ['@gasket/plugin-intl']
  },
  handler: async function create(gasket, context) {
    const {
      files,
      pkg,
      readme,
      viteFramework = 'react',
      viteSsr = false,
      typescript
    } = context;

    const generatorDir = `${__dirname}/../generator`;
    const fileExtension = typescript ? 'ts' : 'js';
    const templateExtension = typescript ? '!(*.js|*.jsx)' : '!(*.ts|*.tsx)';

    // Add framework-specific files
    files.add(
      `${generatorDir}/app/${viteFramework}/**/${templateExtension}`,
      `${generatorDir}/vite/*`
    );

    // Add dependencies
    pkg.add('dependencies', {
      'vite': '^5.0.0',
      '@gasket/plugin-vite': `^${version}`
    });

    // Framework-specific dependencies
    const frameworkDeps = {
      react: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        '@vitejs/plugin-react': '^4.2.0'
      },
      vue: {
        'vue': '^3.4.0',
        '@vitejs/plugin-vue': '^5.0.0'
      }
    };

    if (frameworkDeps[viteFramework]) {
      pkg.add('dependencies', frameworkDeps[viteFramework]);
    }

    // Add scripts
    pkg.add('scripts', {
      'dev': 'vite',
      'build': 'vite build',
      'preview': 'vite preview',
      'local': 'vite --host'
    });

    // Update readme
    await readme.markdownFile(`${generatorDir}/markdown/vite-guide.md`);
    readme.link('Vite Documentation', 'https://vitejs.dev/');
  }
};
```

### 2. Create `@gasket/preset-vite` Package

Create a new preset at `packages/gasket-preset-vite/`:

**Example `lib/index.js`:**
```javascript
import { createRequire } from 'module';
import presetPrompt from './preset-prompt.js';
import presetConfig from './preset-config.js';
import create from './create.js';

const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

export default {
  name,
  version,
  description,
  hooks: {
    presetPrompt,
    presetConfig,
    create
  }
};
```

**Example `lib/preset-config.js`:**
```javascript
// Default Plugins
import pluginCommand from '@gasket/plugin-command';
import pluginDocs from '@gasket/plugin-docs';
import pluginDocusaurus from '@gasket/plugin-docusaurus';
import pluginGit from '@gasket/plugin-git';
import pluginLogger from '@gasket/plugin-logger';
import pluginLint from '@gasket/plugin-lint';

// Vite-specific Plugins
import pluginVite from '@gasket/plugin-vite';
import pluginWinston from '@gasket/plugin-winston';

export default async function presetConfig(gasket, context) {
  const plugins = new Set([
    pluginCommand,
    pluginDocs,
    pluginDocusaurus,
    pluginGit,
    pluginLogger,
    pluginLint,
    pluginVite,
    pluginWinston
  ]);

  // Add test plugins if selected
  if ('testPlugins' in context && context.testPlugins.length > 0) {
    await Promise.all(context.testPlugins.map(async (testPlugin) => {
      const plugin = await import(testPlugin);
      plugins.add(plugin ? plugin.default || plugin : null);
    }));
  }

  // Add TypeScript plugin if selected
  if (context.typescript) {
    const typescriptPlugin = await import('@gasket/plugin-typescript');
    plugins.add(typescriptPlugin.default || typescriptPlugin);
  }

  // Add Express plugin if custom server is needed
  if (context.viteCustomServer) {
    const expressPlugin = await import('@gasket/plugin-express');
    plugins.add(expressPlugin.default || expressPlugin);
  }

  return {
    plugins: Array.from(plugins)
  };
}
```

### 3. Update `create-gasket-app` for Preset Selection

Currently, presets are specified via command-line flags. To improve UX, add an interactive preset selection:

**Add to `packages/create-gasket-app/lib/scaffold/actions/global-prompts.js`:**

```javascript
async function choosePreset(context, prompt) {
  if (context.rawPresets.length > 0) return; // Skip if presets already specified

  const { presetChoice } = await prompt([
    {
      name: 'presetChoice',
      message: 'Which type of application would you like to create?',
      type: 'list',
      choices: [
        { name: 'Next.js Application', value: '@gasket/preset-nextjs' },
        { name: 'Vite Application', value: '@gasket/preset-vite' },
        { name: 'API Only (Express/Fastify)', value: '@gasket/preset-api' },
        { name: 'Custom (specify preset)', value: 'custom' }
      ]
    }
  ]);

  if (presetChoice === 'custom') {
    const { customPreset } = await prompt([
      {
        name: 'customPreset',
        message: 'Enter the preset package name:',
        type: 'input',
        validate: (input) => input.length > 0 || 'Preset name is required'
      }
    ]);
    context.rawPresets = [customPreset];
  } else {
    context.rawPresets = [presetChoice];
  }
}

// Add to questions array
export const questions = [
  choosePreset,  // Add this
  chooseAppDescription,
  choosePackageManager,
  chooseTestPlugins,
  allowExtantOverwriting
];
```

### 4. Generator Templates

Create Vite app templates in `packages/gasket-plugin-vite/generator/`:

**React Template (`app/react/src/App.jsx`):**
```jsx
import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Gasket + Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      <p className="read-the-docs">
        Edit <code>src/App.jsx</code> and save to test HMR
      </p>
    </>
  );
}

export default App;
```

**Vite Config (`vite/vite.config.js`):**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import vue from '@vitejs/plugin-vue';

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      react(), // or vue() for Vue apps
    ],
    server: {
      port: 3000,
      strictPort: true,
      host: true
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  };
});
```

### 5. Ensure Plugin Compatibility

Many existing Gasket plugins can work with Vite apps:

- ✅ **Compatible**: logger, docs, git, lint, jest, vitest, typescript, winston
- ⚠️ **Needs adaptation**: intl (may need Vite plugin), service-worker
- ❌ **Not applicable**: webpack, nextjs

**Update compatible plugins to detect Vite:**

```javascript
// In plugin hooks
module.exports = {
  handler: async function(gasket, context) {
    const isVite = context.useVite || gasket.config.vite;
    const isNext = !isVite && (context.useNextjs || gasket.config.nextjs);
    
    // Conditional logic based on framework
    if (isVite) {
      // Vite-specific implementation
    } else if (isNext) {
      // Next.js-specific implementation
    }
  }
};
```

## Usage Examples

After implementation, developers can create Vite apps using:

```bash
# Interactive mode (with new preset selection)
npx create-gasket-app my-vite-app

# Direct preset specification
npx create-gasket-app my-vite-app --presets @gasket/preset-vite

# With options
npx create-gasket-app my-vite-app \
  --presets @gasket/preset-vite \
  --package-manager pnpm \
  --config '{"viteFramework":"vue","typescript":true}'
```

## Migration Path

For existing Gasket users:
1. No breaking changes to existing Next.js apps
2. Can add Vite support to existing projects via dynamic plugins
3. Shared plugins work across both frameworks

## Testing Strategy

1. Unit tests for new plugin hooks
2. Integration tests for app creation
3. E2E tests for generated apps
4. Cross-framework plugin compatibility tests