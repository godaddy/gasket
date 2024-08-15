import debugPkg from 'debug';
import { lifecycleMethods } from './engine.js';

const reSync = /sync$/i;
const icon = (type) => reSync.test(type) ? '◆' : '◇';

class GasketTracer {
  constructor(branchId) {
    this.traceStack = [];

    const _debug = debugPkg(`gasket:branch:${branchId}`);
    this.trace = (message) => {
      const indent = '  '.repeat(this.traceStack.length);
      _debug(`${indent}${message}`);
    };
  }

  traceHookStart = (pluginName, event) => {
    this.trace(`↪ ${pluginName}:${event}`);
  };

  traceLifecycleStart = (type, event) => {
    const name = `${type}(${event})`;
    const { traceStack } = this;

    if (traceStack.includes(name)) {
      throw new Error(`Recursive lifecycle detected: ${[...traceStack, name].join(' -> ')}`);
    }
    traceStack.push(name);

    const ico = icon(type);
    this.trace(`${ico} ${name}`);
  };

  // TODO: not implemented
  // eslint-disable-next-line no-unused-vars
  traceLifecycleEnd = (type, event) => {
    // const name = `${type}(${event})`;
    // this.trace(`x ${name}`);
  };

  traceActionStart = (name) => {
    const { traceStack } = this;

    traceStack.push(name);
    this.trace(`★ ${name}`);
  };

  // TODO: not implemented
  // eslint-disable-next-line no-unused-vars
  traceActionEnd = (name) => {
    // this.trace(`x ${name}`);
  };
}

export class GasketBranch {
  static _nextBranchId = 0;

  constructor(parent) {
    const parentId = parent.branchId ?? 'root';
    this.branchId = GasketBranch._nextBranchId++;

    const tracer = new GasketTracer(this.branchId);
    tracer.trace(`⋌ ${parentId}`);

    this.proxy = new Proxy(this, {
      get(target, prop) {
        if (prop in target) {
          return target[prop];
        }
        return parent[prop];
      },
      set(target, prop, newValue) {
        if (prop in target) {
          return false;
        }
        // TODO: Do we want to restrict attaching to gaskets?
        parent[prop] = newValue;
        return true;
      }
    });

    const withTrace = (fn, traceStart, traceEnd) => {
      return (...args) => {
        traceStart(...args);
        const result = fn(this.proxy, ...args);
        if (typeof result?.finally === 'function') {
          return result.finally(() => {
            traceEnd(...args);
          });
        }
        traceEnd(...args);
        return result;
      };
    };

    this.traceHookStart = tracer.traceHookStart;
    this.trace = tracer.trace;
    this.hook = parent.engine.hook.bind(parent.engine);

    lifecycleMethods.forEach(name => {
      const lifecycleFn = parent.engine[name];
      this[name] = withTrace(
        lifecycleFn,
        (event) => tracer.traceLifecycleStart(name, event),
        (event) => tracer.traceLifecycleEnd(name, event)
      );
    });

    this.actions = Object.entries(parent.engine.actions)
      .reduce((acc, [name, actionFn]) => {
        acc[name] = withTrace(
          actionFn,
          () => tracer.traceActionStart(name),
          () => tracer.traceActionEnd(name)
        );
        return acc;
      }, {});
  }

  branch = () => {
    const b = new GasketBranch(this.proxy);
    return b.proxy;
  };
}

/**
 *
 * @param gasket
 */
export function makeBranch(gasket) {
  const instance = new GasketBranch(gasket);
  // return instance;
  return instance.proxy;
}
