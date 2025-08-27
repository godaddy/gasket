# @gasket/plugin-command Examples

This document provides working examples for all exported interfaces and types from `@gasket/plugin-command`.

## Plugin Usage

### Basic Plugin Installation

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';

export default makeGasket({
  plugins: [
    pluginCommand
  ]
});
```

## GasketCommandDefinition Interface

### Basic Command

```js
// my-plugin.js
export default {
  name: 'my-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'hello',
        description: 'Say hello',
        action: async () => {
          console.log('Hello from Gasket!');
        }
      };
    }
  }
};
```

### Command with All Properties

```js
export default {
  name: 'advanced-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'deploy',
        description: 'Deploy the application',
        args: [
          {
            name: 'environment',
            description: 'Target environment',
            required: true
          }
        ],
        options: [
          {
            name: 'dry-run',
            description: 'Perform a dry run without actual deployment',
            type: 'boolean',
            short: 'd'
          }
        ],
        action: async (environment, options) => {
          if (options.dryRun) {
            console.log(`Would deploy to ${environment} (dry run)`);
          } else {
            console.log(`Deploying to ${environment}...`);
          }
        },
        hidden: false,
        default: false
      };
    }
  }
};
```

### String Option

```js
export default {
  name: 'config-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'configure',
        description: 'Configure the application',
        options: [
          {
            name: 'config-file',
            description: 'Path to configuration file',
            type: 'string',
            short: 'c'
          }
        ],
        action: async (options) => {
          console.log('Config file:', options.configFile);
        }
      };
    }
  }
};
```

### Boolean Option

```js
export default {
  name: 'verbose-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'analyze',
        description: 'Analyze the codebase',
        options: [
          {
            name: 'verbose',
            description: 'Enable verbose output',
            type: 'boolean',
            short: 'v'
          }
        ],
        action: async (options) => {
          if (options.verbose) {
            console.log('Verbose mode enabled');
          }
          console.log('Running analysis...');
        }
      };
    }
  }
};
```

### Option with Parse Function

```js
export default {
  name: 'port-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'serve',
        description: 'Serve the application',
        options: [
          {
            name: 'port',
            description: 'Port number to serve on',
            type: 'string',
            short: 'p',
            parse: (value) => parseInt(value, 10),
            default: 3000
          }
        ],
        action: async (options) => {
          console.log(`Serving on port: ${options.port}`);
        }
      };
    }
  }
};
```

### Option with Conflicts

```js
export default {
  name: 'output-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'export',
        description: 'Export data',
        options: [
          {
            name: 'json',
            description: 'Export as JSON',
            type: 'boolean',
            conflicts: ['xml', 'csv']
          },
          {
            name: 'xml',
            description: 'Export as XML',
            type: 'boolean',
            conflicts: ['json', 'csv']
          },
          {
            name: 'csv',
            description: 'Export as CSV',
            type: 'boolean',
            conflicts: ['json', 'xml']
          }
        ],
        action: async (options) => {
          if (options.json) console.log('Exporting as JSON');
          if (options.xml) console.log('Exporting as XML');
          if (options.csv) console.log('Exporting as CSV');
        }
      };
    }
  }
};
```

## Commands Lifecycle Hook

### Single Command Hook

```js
export default {
  name: 'single-command-plugin',
  hooks: {
    /** @type {import('@gasket/core').HookHandler<'commands'>} */
    commands(gasket) {
      return {
        id: 'migrate',
        description: 'Run database migrations',
        action: async () => {
          console.log('Running migrations...');
          await gasket.exec('migrate');
        }
      };
    }
  }
};
```

## Build Lifecycle Hook

### Build Hook with Configuration

```js
export default {
  name: 'asset-build-plugin',
  hooks: {
    async build(gasket) {
      const { root, env } = gasket.config;
      console.log(`Building assets for ${env} environment`);

      // Custom build logic here
      if (env === 'production') {
        console.log('Optimizing for production...');
      }
    }
  }
};
```

## Command-based Configuration

### Environment-specific Command Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';

export default makeGasket({
  plugins: [pluginCommand],

  // Base configuration
  apiUrl: 'http://localhost:3000',

  // Command-specific configuration
  commands: {
    'deploy': {
      apiUrl: 'https://api.production.com',
      timeout: 30000
    },
    'test': {
      apiUrl: 'https://api.staging.com',
      timeout: 5000
    }
  }
});
```

### Using Command Configuration in Action

```js
export default {
  name: 'deploy-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'deploy',
        description: 'Deploy to production',
        action: async () => {
          // Access command-specific configuration
          const { apiUrl, timeout } = gasket.config;
          console.log(`Deploying to: ${apiUrl}`);
          console.log(`Timeout: ${timeout}ms`);
        }
      };
    }
  }
};
```
