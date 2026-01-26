# Configuring Gasket

All configuration of the Gasket plugins is centralized in a `gasket.js`
file in the root of your application.

## Plugins

To configure plugins in an app, update the `plugins` array in
`gasket.js` with imported gasket plugin packages.

```js
import pluginName from '@gasket/plugin-name';

export default makeGasket({
  plugins: [
    pluginName
    /* Plugins to add */ 
  ],
  // ...
});
```

## Environments

The configuration system supports the concept of
[environments](https://en.wikipedia.org/wiki/Deployment_environment). An
application will have certain configuration values that are not
environment-specific and some, like service URLs, which are. Additionally, an
environment may be subdivided further in other ways, for example distributed in
multiple data centers, needing to use specific URLs for DC-local deployments of
dependencies.

To augment the base `gasket.js` with environment-specific config, add an
"environments" property to the config object, set to an object. Each key in this
object should be an environment identifier, and each value is a configuration
structure to deep merge into the base config. Use `.` in these keys to specify
sub-environments. For example, here's a theoretical `gasket.js`:

```js
export default makeGasket({
  someService: {
    enableSomeFeature: false
  },
  environments: {
    dev: {
      someService: {
        url: 'https://your-dev-service-endpoint.com'
      }
    },
    test: {
      someService: {
        url: 'https://your-test-service-endpoint.com'
      }
    },
    prod: {
      someService: {
        enableSomeFeature: true
      }
    },
    'prod.datacenter1': {
      someService: {
        url: 'https://your-datacenter1-prod-service-endpoint.com'
      }
    },
    'prod.datacenter2': {
      someService: {
        url: 'https://your-datacenter2-prod-service-endpoint.com'
      }
    }
  }
});
```

When accessing configuration in the `prod.datacenter1` environment, the base
configuration is augmented with the `prod` environment settings, then the
`prod.datacenter1` settings, resulting in:

```json
{
  "someService": {
    "enableSomeFeature": true,
    "url": "https://your-datacenter1-prod-service-endpoint.com"
  }
}
```

The last step is making sure that Gasket is told which environment it is running
in when starting up. To do so, set the `GASKET_ENV` environment variable.
Alternatively, you can programmatically set an `env` property at the top level
of your configuration, enabling you to use any arbitrary environment derivation logic.

## Commands

Similar to environments, you can add configuration in the `gasket.js` file to
only be used when running specific commands.

```js
export default makeGasket({
  commands: {
    'my-command': {
      someService: {
        enableSomeFeature: true
      }
    }
  }
});
```

## Accessing Gasket configuration in your application

You can access the Gasket configuration in your application by importing the `gasket` object or through plugin hooks.

```js
// example-plugin.js
export const name = 'example-plugin';

export const hooks = {
  express: async function (gasket, express) {
    console.log(gasket.config)
  }
};

export default { name, hooks };

// app-code.js

import gasket from './gasket.js';

console.log(gasket.config);
```

## External configuration

### Authoring a config plugin

If a config plugin does not yet exist for your configuration platform, writing
one is straightforward. For Gasket-level configuration, hook the `configure`
event. Your hook will be passed a config object, and you'll return an augmented
config object.

```js
// theoretical.js plugin
export default {
  name: 'theoretical',
  hooks: {
    configure(gasket, baseConfig) {
      const additionalConfig = addAdditionalConfig();
      return {
        ...baseConfig,
        ...additionalConfig
      };
    }
  }
}
```
