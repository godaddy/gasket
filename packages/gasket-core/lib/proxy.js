import debugPkg from 'debug';
import { lifecycleMethods } from './engine.js';
const debug = debugPkg('gasket:engine');

const reSync = /sync$/i;
const icon = (type) => reSync.test(type) ? '◆' : '◇';

class Tracers {
  constructor(id) {
    this.traceStack = [];
    this.id = id;
  }

  traceHookStart = (pluginName, event) => {
    const { id, traceStack } = this;
    debug(`[${id}]${'  '.repeat(traceStack.length)}↪ ${pluginName}:${event}`);
  };

  traceLifecycleStart = (type, event) => {
    const name = `${type}(${event})`;
    const { id, traceStack } = this;

    if (traceStack.includes(name)) {
      throw new Error(`Recursive lifecycle detected: ${[...traceStack, name].join(' -> ')}`);
    }
    traceStack.push(name);

    const ico = icon(type);
    debug(`[${id}]${'  '.repeat(traceStack.length)}${ico} ${name}`);
  };

  // TODO: not implemented
  // eslint-disable-next-line no-unused-vars
  traceLifecycleEnd = (type, event) => {
    // const name = `${type}(${event})`;
    // debug(`[${id}]${'  '.repeat(traceStack.length)}x ${name}`);
  };

  traceActionStart = (name) => {
    const { id, traceStack } = this;

    traceStack.push(name);
    debug(`[${id}]${'  '.repeat(traceStack.length)}⚡︎ ${name}`);
  };

  // TODO: not implemented
  // eslint-disable-next-line no-unused-vars
  traceActionEnd = (name) => {
    // debug(`[${id}]${'  '.repeat(traceStack.length)}x ${name}`);
  };
}

export class GasketProxy {
  constructor(gasket, id) {
    this.id = id;

    const tracers = new Tracers(id);

    const withTrace = (fn, traceStart, traceEnd) => {
      return (...args) => {
        traceStart(...args);
        const result = fn(this, ...args);
        if (typeof result?.finally === 'function') {
          return result.finally(() => {
            traceEnd(...args);
          });
        }
        traceEnd(...args);
        return result;
      };
    };

    this.traceHookStart = tracers.traceHookStart;

    // console.log('KEYS', Object.keys(gasket).filter(key => !lifecycleMethods.includes(key)));

    // Object.keys(gasket)
    //   .filter(key => !lifecycleMethods.includes(key))
    //   .forEach(key => {
    //     this[key] = gasket[key];
    //   });

    this.hook = gasket.engine.hook.bind(gasket.engine);

    lifecycleMethods.forEach(name => {
      const lifecycleFn = gasket.engine[name];
      this[name] = withTrace(
        lifecycleFn,
        (event) => tracers.traceLifecycleStart(name, event),
        (event) => tracers.traceLifecycleEnd(name, event)
      );
    });

    this.actions = Object.entries(gasket.engine.actions)
      .reduce((acc, [name, actionFn]) => {
        acc[name] = withTrace(
          actionFn,
          () => tracers.traceActionStart(name),
          () => tracers.traceActionEnd(name)
        );
        return acc;
      }, {});
  }
}

/**
 *
 * @param gasket
 * @param id
 */
export function makeProxy(gasket, id) {
  const driver = new GasketProxy(gasket, id);
  const proxy = new Proxy(driver, {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      return gasket[prop];
    },
    set(target, prop, newValue) {
      if (prop in target) {
        return false;
      }
      // TODO: Do we want to restrict attaching to gaskets?
      gasket[prop] = newValue;
      return true;
    }
  });
  return proxy;
}
