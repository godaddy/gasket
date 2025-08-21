# @gasket/plugin-happyfeet Examples

Working examples for the methods and functions exported by this package.

## Plugin Installation and Basic Setup

```js
import { makeGasket } from '@gasket/core';
import pluginHappyfeet from '@gasket/plugin-happyfeet';

export default makeGasket({
  plugins: [
    pluginHappyfeet
  ]
});
```

### Gasket Configuration

```js
export default makeGasket({
  plugins: [
    pluginHappyfeet
  ],
  happyFeet: {
    escalationSoftLimitMin: 20, // 20s
    escalationSoftLimitMax: 300, // 5min
    uncaughtExceptionSoftLimit: 1,
    uncaughtExceptionHardLimit: undefined,
    rssSoftLimit: 0.9 * 1024 * 1024 * 1024, // ~900MB
    rssHardLimit: 1.8 * 1024 * 1024 * 1024, // ~1.9GB
    logOnUnhappy: true
  }
});
```

## getHappyFeet Action

### Basic Usage

```js
// Basic usage with configuration from gasket.js
const happy = gasket.actions.getHappyFeet();
console.log(happy.state); // Current state
console.log(happy.STATE.UNHAPPY); // Reference to unhappy state constant
```

### Checking Health State

```js
const happy = gasket.actions.getHappyFeet();

if (happy.state === happy.STATE.UNHAPPY) {
  console.log('Application is in an unhappy state');
} else {
  console.log('Application is healthy');
}
```
