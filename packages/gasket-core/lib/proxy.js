import debugPkg from 'debug';
import { lifecycleMethods } from './engine.js';
const debug = debugPkg('gasket:engine');

const reSync = /sync$/i;
const icon = (type) => reSync.test(type) ? '◆' : '◇';

export class GasketProxy {
  constructor(gasket, id) {
    this.id = id;

    const traceStack = [];

    // this.trace = {
    const traceHookStart = (pluginName, event) => {
      debug(`[${id}]${'  '.repeat(traceStack.length)}↪ ${pluginName}:${event}`);
    };

    const traceLifecycleStart = (type, event) => {
      const name = `${type}(${event})`;
      if (traceStack.includes(name)) {
        throw new Error(`Recursive lifecycle detected: ${[...traceStack, name].join(' -> ')}`);
      }
      traceStack.push(name);

      const ico = icon(type);
      debug(`[${id}]${'  '.repeat(traceStack.length)}${ico} ${name}`);
    };

    // TODO: not implemented
    // eslint-disable-next-line no-unused-vars
    const traceLifecycleEnd = (type, event) => {
      // const name = `${type}(${event})`;
      // debug(`[${id}]${'  '.repeat(traceStack.length)}x ${name}`);
    };

    const traceActionStart = (name) => {
      traceStack.push(name);
      debug(`[${id}]${'  '.repeat(traceStack.length)}⚡︎ ${name}`);
    };

    // TODO: not implemented
    // eslint-disable-next-line no-unused-vars
    const traceActionEnd = (name) => {
      // debug(`[${id}]${'  '.repeat(traceStack.length)}x ${name}`);
    };

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

    this.traceHookStart = traceHookStart;

    // console.log('KEYS', Object.keys(gasket).filter(key => !lifecycleMethods.includes(key)));

    Object.keys(gasket).forEach(key => {
      this[key] = gasket[key];
    });

    this.hook = gasket.engine.hook.bind(gasket.engine);
    this.attach = gasket.attach;

    lifecycleMethods.forEach(name => {
      const lifecycleFn = gasket.engine[name];
      this[name] = withTrace(
        lifecycleFn,
        (event) => traceLifecycleStart(name, event),
        (event) => traceLifecycleEnd(name, event)
      );
    });

    this.actions = Object.entries(gasket.engine.actions)
      .reduce((acc, [name, actionFn]) => {
        acc[name] = withTrace(
          actionFn,
          () => traceActionStart(name),
          () => traceActionEnd(name)
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
    }
  });
  return proxy;
}
