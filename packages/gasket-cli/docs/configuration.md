# Configuring Gasket

Configuring a Gasket application involves two key aspects: configuring Gasket
itself and managing application-specific settings. This guide focuses on the
former, while application-specific settings are made more convenient with the
`config` plugin, which is covered in detail in the [config plugin
documentation][config plugin].

All Gasket plugin configurations are consolidated in a `gasket.config.js` file
located at the root of your application. This file must adhere to the CommonJS
module format and export a configuration object. Its presence is essential for
the Gasket CLI to recognize that it is working within the context of an
application and configure itself accordingly.

## Presets and Plugins

To configure plugins and presets for your application, you can update the
`plugins` object within `gasket.config.js`. This object consists of three string
arrays:

```js
module.exports = {
  plugins: {
    presets: [ /* Presets you want to add */ ],
    add:     [ /* Plugins to add after presets are added */ ],
    remove:  [ /* Plugins to remove */ ]
  },
  // ...
}
```

### Short Names

Items within these arrays represent module names. Gasket supports shorthand
naming, where `'@gasket/mocha'` expands to `@gasket/plugin-mocha` in the `add`
and `remove` arrays. Similarly, for `presets`, `@gasket/nextjs` expands to
`@gasket/preset-nextjs`.

For more details, refer to the [naming convention] documentation.

## Environments

The configuration system supports the concept of
[environments](https://en.wikipedia.org/wiki/Deployment_environment). An
application often has certain configuration values that are not specific to an
environment and others, like service URLs, which are environment-specific.
Furthermore, an environment can be subdivided further, such as being distributed
across multiple data centers, each requiring specific URLs for deployment of
dependencies.

To enhance the base `gasket.config.js` with environment-specific configuration,
add an "environments" property to the configuration object, set to an object.
Each key in this object represents an environment identifier, and each value is
a configuration structure that will be deeply merged into the base
configuration. You can use `.` in these keys to specify sub-environments. For
example:

```js
module.exports = {
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
};
```

When accessing configuration in the `prod.datacenter1` environment, the base
configuration is augmented with the `prod` environment settings, followed by the
`prod.datacenter1` settings, resulting in:

```json
{
  "someService": {
    "enableSomeFeature": true,
    "url": "https://your-datacenter1-prod-service-endpoint.com"
  }
}
```

The final step is to ensure that Gasket knows which environment it is running in
during startup. There are three ways to achieve this:

1. Set the `GASKET_ENV` environment variable.
2. Pass an `--env` command line argument when executing any `gasket` command.
3. Programmatically set an `env` property at the top level of your
   configuration, allowing you to implement custom logic for environment
   derivation.

## Local Development Configuration

Local development represents a unique scenario in Gasket. Typically, you'll
start the development server with the `gasket local` command, which uses a
development-friendly version of the server rather than `gasket start`. These
commands are enabled for applications through the [start plugin]. Additionally,
you may have local settings that you want to change without accidentally
committing the changes to your repository, such as pointing to locally-running
dependencies.

To facilitate smooth local development, the Gasket CLI can read a special
`gasket.config.local.js`, `gasket.config.local.json`, or
`gasket.config.local.js` file and merge it with your `dev` configuration
environment. This file should be added to your `.gitignore` file so that each
developer can have distinct overrides.

## Commands

Similarly to per-environment overrides, configuration can also be customized for
specific Gasket commands. This can be useful for enabling or disabling plugins
for certain commands. Here's an example:

```js
module.exports = {
  plugins: {
    presets: ['@gasket/preset-nextjs', '@gasket/preset-pwa']
  },
  commands: {
    local: {
      plugins: {
        remove: ['@gasket/plugin-service-worker']
      }
    }
  }
};
```

## Accessing Gasket Configuration in Your Application

While it is not recommended to configure your application code directly through
the `gasket.config.js` file, if you need to access the Gasket configuration, you
can add a [lifecycle script][lifecycle plugin] to your application and access
the Gasket configuration via the `gasket.config` property:

```js
// lifecycles/express.js

module.exports = (gasket, app) => {
  const gasketConfig = gasket.config;
  // ...
};
```

## External Configuration

### Authoring a Config Plugin

If there is no existing config plugin for your configuration platform, creating
one is straightforward. For Gasket-level configuration, you can hook into the
`configure` event. Your hook will receive a config object and should return an
augmented config object or a Promise containing one for async configuration.

```js
// theoretical.js plugin
module.exports = {
  hooks: {
    async configure(gasket, baseConfig) {
      const remoteConfig = await theoreticalClient.getConfig(baseConfig.theoretical.url);
      return {
        ...baseConfig,
        ...remoteConfig
      };
    }
  }
}
```

The [config plugin] provides similar lifecycle hooks for application-level
configuration.

[config plugin]: /packages/gasket-plugin-config/README.md
[start plugin]: /packages/gasket-plugin-start/README.md
[lifecycle plugin]: /packages/gasket-plugin-lifecycle/README.md
[naming convention]: /packages/gasket-resolve/README.md
