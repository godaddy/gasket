# @gasket/plugin-git Examples

## Overview

**@gasket/plugin-git is a create-only plugin** - it is only used during the `create-gasket-app` process and does **NOT** get installed in the final application. This plugin:

- Prompts users whether to initialize a git repository during app creation
- Provides a `Gitignore` utility for other plugins to add gitignore rules during creation
- Initializes git repository and creates the first commit after app generation

## Creating Apps with Git

### Creating an app with git initialization

```bash
# During app creation, the plugin will prompt:
npx create-gasket-app@latest my-app --template @gasket/template-api-express

# To skip the prompt and initialize git automatically
npx create-gasket-app@latest my-app --template @gasket/template-api-express --config '{"gitInit": true}'
```

## Gitignore Class Usage for Create Plugins

The Gitignore class is available through the create context when developing **other create plugins** that need to add gitignore rules during app generation. This is only available during the `create` lifecycle hook.

### Basic gitignore usage in a plugin

```js
// my-plugin.js
export default {
  name: 'my-plugin',
  hooks: {
    create(gasket, createContext) {
      const { gitignore } = createContext;

      if (gitignore) {
        // Add a single file to gitignore
        gitignore.add('secret-config.json');
      }
    }
  }
};
```
