# @gasket/plugin-happy-feet

Integrates with [happy-feet](https://github.com/asilvas/happy-feet#usage) to add application instance termination when health metrics such as memory usage enter a bad state.

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-happy-feet
```

#### Existing apps

```
npm i @gasket/plugin-happy-feet
```

Modify the `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-happy-feet'
    ]
  }
}
```

## Configuration

You can specify the various [happy-feet](https://github.com/asilvas/happy-feet#usage) config options in `gasket.config.js`.

```js
// gasket.config.js
module.exports = {
   happyFeet: {
    // https://github.com/asilvas/happy-feet#usage
    escalationSoftLimitMin: 20, // 20s
    escalationSoftLimitMax: 300, // 5min
    uncaughtExceptionSoftLimit: 1,
    uncaughtExceptionHardLimit: void 0,
    rssSoftLimit: 0.9 * 1024 * 1024 * 1024, // ~900MB
    rssHardLimit: 1.8 * 1024 * 1024 * 1024, // ~1.9GB
    logOnUnhappy: true
  }
};
```

[Happy Feet](https://github.com/asilvas/happy-feet#usage) for gasket has no default configuration.


### Usage
You can call gasket.happyFeet directly to manually change the health status for any reason by 
setting `gasket.happyFeet.status = 'unhappy'` in any context that you have the gasket object available to your function. 
For example, you can define middleware to run before any healthchecks to define custom termination logic for things not included in the default metrics monitoring.
## License
[MIT](./LICENSE.md)

<!-- LINKS -->
