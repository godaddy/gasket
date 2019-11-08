# Configuring gasket

There are two parts to configuring a gasket application: configuring the
behavior of gasket itself and configuring application-specific settings. This
guide discusses the first topic. For the second, the config plugin makes app-level
config more convenient. The documentation for that is covered in the
[plugin's documentation][config plugin].

All configuration of the _gasket framework_ is centralized in
a `gasket.config.js` file in the root of your application. This file must be a
CommonJS file exporting a config object. If this file isn't present, a set of
defaults will be employed.

## Environments

The configuration system supports the concept of
[environments](https://en.wikipedia.org/wiki/Deployment_environment). An
application will have certain configuration values that are not
environment-specific and some, like service URLs, which are. Additionally, an
environment may be subdivided further in other ways, for example distributed
in multiple data centers, needing to use specific URLs for DC-local deployments
of dependencies.

To augment the base `gasket.config.js` with environment-specific config, add an
"environments" property to the config object, set to an object. Each key in this
object should be an environment identifier, and each value is a configuration
structure to deep merge into the base config. Use `.` in these keys to specify
sub-environments. For example, here's a theoretical `gasket.config.js`:

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

The last step is making sure that gasket is told which environment it is running
in when starting up. There are three ways of doing this. The first would be to
set the `NODE_ENV` environment variable. The second would be to pass an `--env`
command line argument when running the `gasket` command. The third is to
programmatically set an `env` property at the top level of your configuration,
which would enable you to use any arbitrary environment derivation logic.

## Local development configuration

The environment for local development is somewhat of a special case in Gasket.
For one, you'll typically start via the `gasket local` command to use a special
development-friendly version of the server instead of `gasket start`.
Additionally, you may have local settings you want to change without
accidentally committing the changes to your repository, like pointing to
locally-running dependencies.

To support easy local development, `gasket` can read a special
`gasket.config.local.js`, use the `local` environment in gasket.config.js, or
`gasket.config.local.json` file and merge it in with
your `dev` configuration environment. This file should be in your `.gitignore`
file so that each developer can have distinct overrides.

## Accessing gasket configuration in your application

Configuring your application through the gasket config file is not recommended.
See the [config plugin] docs for more information on maintaining application
configuration. If you do need access to the gasket configuration, you can add a
[lifecycle script][lifecycle plugin] to your application and access the gasket
configuration via gasket's `config` property:

```js
// lifecycles/express.js

module.exports = (gasket, app) => {
  const gasketConfig = gasket.config;
  // ...
};
```

## External configuration

### Authoring a config plugin

If a config plugin does not yet exist for your configuration platform, writing
one is straightforward. For gasket-level configuration, hook the `configure` event.
Your hook will be passed a config object, and you'll return an augmented config
object or a Promise containing one for async config.

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

The [config plugin] has similar lifecycle hooks available for application-level configuration.

[config plugin]: /packages/gasket-plugin-config
[lifecycle plugin]: /packages/gasket-lifecycle-plugin#gasketlifecycle-plugin
