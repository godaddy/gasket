# @gasket/core Examples

This document provides working examples for all exported functions, methods, and classes from `@gasket/core`.

## Exported Functions

### `makeGasket(config)`

Creates a new Gasket instance with the provided configuration.

```js
import { makeGasket } from '@gasket/core';

// Basic example
const gasket = makeGasket({
  plugins: [
    {
      name: 'example-plugin',
      hooks: {
        init() {
          console.log('Plugin initialized');
        }
      }
    }
  ]
});

// With environment overrides
const gasket = makeGasket({
  plugins: [/* plugins */],
  port: 3000,
  environments: {
    prod: {
      port: 8080
    },
    local: {
      port: 3001
    }
  }
});

// With command-specific config
const gasket = makeGasket({
  plugins: [/* plugins */],
  commands: {
    build: {
      optimizations: true
    }
  }
});
```

## Gasket Instance Methods

### Configuration and Properties

```js
import { makeGasket } from '@gasket/core';

const gasket = makeGasket({
  plugins: [{
    name: 'my-plugin',
    hooks: {
      init() { console.log('Init hook'); },
      configure(gasket, config) {
        return { ...config, customProp: 'value' };
      }
    },
    actions: {
      myAction(gasket, arg) {
        return `Action called with: ${arg}`;
      }
    }
  }]
});

// Access configuration
console.log(gasket.config.env); // 'local' (default)
console.log(gasket.config.root); // process.cwd()

// Access the unique instance symbol
console.log(typeof gasket.symbol); // 'symbol'

// Access actions
const result = gasket.actions.myAction('test');
console.log(result); // 'Action called with: test'

// Wait for gasket to be ready
await gasket.isReady;
console.log('Gasket is fully initialized');
```

### `exec(event, ...args)` - Parallel Hook Execution

```js
const gasket = makeGasket({
  plugins: [
    {
      name: 'plugin-1',
      hooks: {
        async process(gasket, data) {
          return `Plugin 1 processed: ${data}`;
        }
      }
    },
    {
      name: 'plugin-2',
      hooks: {
        async process(gasket, data) {
          return `Plugin 2 processed: ${data}`;
        }
      }
    }
  ]
});

const results = await gasket.exec('process', 'input-data');
console.log(results); // ['Plugin 1 processed: input-data', 'Plugin 2 processed: input-data']
```

### `execSync(event, ...args)` - Synchronous Hook Execution

```js
const gasket = makeGasket({
  plugins: [{
    name: 'sync-plugin',
    hooks: {
      validate(gasket, input) {
        return input.length > 0;
      }
    }
  }]
});

const results = gasket.execSync('validate', 'test-input');
console.log(results); // [true]
```

### `execWaterfall(event, value, ...args)` - Sequential Processing

```js
const gasket = makeGasket({
  plugins: [
    {
      name: 'transformer-1',
      hooks: {
        async transform(gasket, data) {
          return data.toUpperCase();
        }
      }
    },
    {
      name: 'transformer-2',
      hooks: {
        async transform(gasket, data) {
          return `Processed: ${data}`;
        }
      }
    }
  ]
});

const result = await gasket.execWaterfall('transform', 'hello');
console.log(result); // 'Processed: HELLO'
```

### `execWaterfallSync(event, value, ...args)` - Synchronous Waterfall

```js
const gasket = makeGasket({
  plugins: [
    {
      name: 'sync-transformer-1',
      hooks: {
        syncTransform(gasket, data) {
          return data.toUpperCase();
        }
      }
    },
    {
      name: 'sync-transformer-2',
      hooks: {
        syncTransform(gasket, data) {
          return `Processed: ${data}`;
        }
      }
    }
  ]
});

const result = gasket.execWaterfallSync('syncTransform', 'hello');
console.log(result); // 'Processed: HELLO'
```

### `execApply` - Custom Handler Application

```js
const gasket = makeGasket({
  plugins: [{
    name: 'express-plugin',
    hooks: {
      express(gasket, app) {
        app.use((req, res, next) => {
          console.log('Handler executed');
          next();
        });
      }
    }
  }]
});

// Apply custom logic to each plugin's hook
const results = await gasket.engine.execApply(gasket, 'express', async (plugin, handler) => {
  console.log(`Processing express hook from ${plugin.name}`);
  const result = handler(gasket);
  // Could perform additional setup here
  return result;
});
```

### `execApplySync` - Synchronous Custom Handler Application

```js
const gasket = makeGasket({
  plugins: [{
    name: 'config-plugin',
    hooks: {
      buildConfig(gasket) {
        return { value: 'from-plugin' };
      }
    }
  }]
});

const configs = gasket.engine.execApplySync(gasket, 'buildConfig', (plugin, handler) => {
  console.log(`Getting config from ${plugin.name}`);
  return handler(gasket);
});
console.log(configs); // [{ value: 'from-plugin' }]
```

## Plugin Examples

### Basic Plugin Structure

```js
const basicPlugin = {
  name: 'basic-plugin',
  version: '1.0.0',
  description: 'A basic example plugin',
  hooks: {
    init(gasket) {
      console.log('Plugin initialized');
    },
    configure(gasket, config) {
      return {
        ...config,
        pluginConfig: 'added by plugin'
      };
    }
  }
};

const gasket = makeGasket({
  plugins: [basicPlugin]
});
```

### Plugin with Actions

```js
const actionPlugin = {
  name: 'action-plugin',
  hooks: {
    init() { /* initialization */ }
  },
  actions: {
    getValue(gasket, key) {
      return gasket.config[key] || 'default';
    },
    async fetchData(gasket, url) {
      // Simulate API call
      return { data: `fetched from ${url}` };
    }
  }
};

const gasket = makeGasket({ plugins: [actionPlugin] });
const value = gasket.actions.getValue('env'); // 'local'
const data = await gasket.actions.fetchData('api/users');
```

### Plugin with Timing Dependencies

```js
const dependentPlugin = {
  name: 'dependent-plugin',
  dependencies: ['first-plugin'],
  hooks: {
    configure: {
      timing: {
        after: ['first-plugin'],
        before: ['last-plugin']
      },
      handler(gasket, config) {
        return { ...config, dependentValue: true };
      }
    }
  }
};

const gasket = makeGasket({
  plugins: [
    {
      name: 'first-plugin',
      hooks: {
        configure: (gasket, config) => ({ ...config, first: true })
      }
    },
    dependentPlugin,
    {
      name: 'last-plugin',
      hooks: {
        configure: (gasket, config) => ({ ...config, last: true })
      }
    }
  ]
});
```

## Advanced Usage

### Error Handling in Hooks

```js
const gasket = makeGasket({
  plugins: [
    {
      name: 'error-plugin',
      hooks: {
        async process(gasket, data) {
          if (!data) {
            throw new Error('Data is required');
          }
          return `Processed: ${data}`;
        }
      }
    },
    {
      name: 'safe-plugin',
      hooks: {
        async process(gasket, data) {
          return `Safe processing: ${data || 'default'}`;
        }
      }
    }
  ]
});

try {
  // This will throw because the first plugin rejects null data
  await gasket.exec('process', null);
} catch (error) {
  console.error('Hook execution failed:', error.message);
}
```

### Built-in Lifecycle Examples

```js
const gasket = makeGasket({
  plugins: [{
    name: 'lifecycle-demo',
    hooks: {
      init(gasket) {
        console.log('1. Init hook - synchronous setup');
      },
      configure(gasket, config) {
        console.log('2. Configure hook - modify config');
        return { ...config, configured: true };
      },
      async prepare(gasket, config) {
        console.log('3. Prepare hook - async setup');
        return { ...config, prepared: true };
      },
      async ready(gasket) {
        console.log('4. Ready hook - gasket is ready');
      }
    }
  }]
});

// Wait for full initialization
await gasket.isReady;
console.log('Final config:', gasket.config);
```
