# @gasket/plugin-happyfeet

Integrates with [happy-feet](https://github.com/asilvas/happy-feet#usage) to add application instance termination when health metrics such as memory usage enter a bad state.

## Installation

```
npm i @gasket/plugin-happyfeet
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginHappyfeet from '@gasket/plugin-happyfeet';

export default makeGasket({
  plugins: [
+   pluginHappyFeet
  ]
});
```

## Configuration

You can specify the various [happy-feet](https://github.com/asilvas/happy-feet#usage) config options in `gasket.js`.

```js
// gasket.js
export default makeGasket({
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
});
```

[Happy Feet](https://github.com/asilvas/happy-feet#usage) for gasket has no default configuration.

## Actions

### getHappyFeet

This action is used to configure and get a [Happy Feet](https://github.com/asilvas/happy-feet#usage) instance.
You can specify the various [happy-feet](https://github.com/asilvas/happy-feet#usage) config options in the gasketConfig
or pass the config object directly to the action.

#### gasketConfig example

```js
// gasket.js
export default makeGasket({
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
});
```

```js
const happy = gasket.actions.getHappyFeet();
```

#### happyConfig example

```js
const happyConfig =  {
  // https://github.com/asilvas/happy-feet#usage
  escalationSoftLimitMin: 20, // 20s
  escalationSoftLimitMax: 300, // 5min
  uncaughtExceptionSoftLimit: 1,
  uncaughtExceptionHardLimit: void 0,
  rssSoftLimit: 0.9 * 1024 * 1024 * 1024, // ~900MB
  rssHardLimit: 1.8 * 1024 * 1024 * 1024, // ~1.9GB
  logOnUnhappy: true
}
const happy = gasket.actions.getHappyFeet(happyConfig);
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->
