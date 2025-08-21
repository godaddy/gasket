# @gasket/plugin-metadata Examples

This document provides working examples for all exported interfaces and functions from `@gasket/plugin-metadata`.

### Basic Plugin Setup

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginMetadata from '@gasket/plugin-metadata';

export default makeGasket({
  plugins: [
    pluginMetadata
  ]
});
```

## metadata

Customize plugin metadata at runtime.

```js
// Basic metadata customization
export default {
  name: 'gasket-plugin-example',
  hooks: {
    metadata(gasket, data) {
      return {
        ...data,
        // Add custom metadata
        customField: 'example-value',
        // Define supported lifecycles
        lifecycles: [{
          name: 'exampleHook',
          description: 'Executes custom example logic',
          method: 'exec',
          parent: 'build'
        }],
        // Define actions provided by this plugin
        actions: [{
          name: 'doSomething',
          description: 'Performs example action',
          link: 'README.md#doSomething'
        }],
        // Declare supporting modules
        modules: [
          {
            name: 'example-helper',
            version: '1.0.0',
            description: 'Helper module for example plugin'
          }
        ]
      };
    }
  }
};
```

```js
// Complex metadata with configurations
export default {
  name: 'gasket-plugin-advanced',
  hooks: {
    metadata(gasket, data) {
      return {
        ...data,
        configurations: [{
          name: 'apiUrl',
          description: 'API endpoint URL',
          type: 'string',
          default: 'https://api.example.com'
        }, {
          name: 'enableCache',
          description: 'Enable caching mechanism',
          type: 'boolean',
          default: true
        }],
        commands: [{
          name: 'deploy',
          description: 'Deploy the application',
          link: 'docs/deploy.md'
        }],
        guides: [{
          name: 'Getting Started',
          description: 'Quick start guide',
          link: 'docs/getting-started.md'
        }]
      };
    }
  }
};
```

## Module Package.json Configuration

```json
{
  "name": "@my-org/gasket-utils",
  "version": "1.0.0",
  "description": "Utility functions for Gasket applications",
  "gasket": {
    "metadata": {
      "guides": [
        {
          "name": "API Reference",
          "description": "Complete API documentation",
          "link": "docs/api.md"
        }
      ]
    }
  }
}
```

### Advanced Module Metadata

```json
{
  "name": "@my-org/gasket-theme",
  "version": "2.1.0",
  "description": "Theme components and utilities",
  "gasket": {
    "metadata": {
      "guides": [
        {
          "name": "Theme Guide",
          "description": "How to customize themes",
          "link": "docs/theming.md"
        },
        {
          "name": "Component Library",
          "description": "Available theme components",
          "link": "docs/components.md"
        }
      ],
      "configurations": [
        {
          "name": "primaryColor",
          "description": "Primary theme color",
          "type": "string",
          "default": "#0066cc"
        }
      ]
    }
  }
}
```
