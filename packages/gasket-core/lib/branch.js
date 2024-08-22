import debugPkg from 'debug';
import { lifecycleMethods } from './engine.js';
import { Gasket } from './gasket.js';

const lifecycles = Object.fromEntries(lifecycleMethods.map(method => [method, true]));

const reSync = /sync$/i;
const icon = (type) => reSync.test(type) ? '◆' : '◇';

class IsolateTracer {
  constructor(parent, branchId) {
    // make a stack copy for each isolate to avoid contamination
    this.traceStack = [...(parent?.traceStack ?? [])];
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

  traceActionStart = (name) => {
    const { traceStack } = this;

    traceStack.push(name);
    this.trace(`★ ${name}`);
  };

  // TODO: not implemented
  // eslint-disable-next-line no-unused-vars
  traceLifecycleEnd = (type, event) => {
    // const name = `${type}(${event})`;
    // this.trace(`x ${name}`);
  };

  // TODO: not implemented
  // eslint-disable-next-line no-unused-vars
  traceActionEnd = (name) => {
    // this.trace(`x ${name}`);
  };
}

/** @type {import('@gasket/core').GasketTrace} */
export class GasketTrace {
  static _nextBranchId = 0;

  constructor(parent, newBranchId = null) {
    this.branchId = newBranchId ?? parent.branchId;
    this.engine = parent.engine;

    const tracer = this._tracer = new IsolateTracer(parent._tracer, this.branchId);
    if (newBranchId) {
      const parentId = parent.branchId ?? 'root';
      tracer.trace(`⋌ ${parentId}`);
    }

    const self = this;
    this._proxy = new Proxy(this, {
      get(target, prop) {
        if (typeof prop === 'string' && lifecycles[prop] === true) {
          return isolateLifecycle(self, prop, parent.engine[prop]);
        }
        if (prop === 'actions') {
          return interceptActions(self, parent.engine.actions);
        }
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

    this.traceHookStart = tracer.traceHookStart;
    this.trace = tracer.trace;

    this.traceRoot = () => {
      if (parent instanceof Gasket) return parent;
      return parent.traceRoot();
    };
  }

  traceBranch = () => {
    return makeBranch(this._proxy);
  };
}

/**
 * Wrap a lifecycle function to trace start and end.
 * An isolate passed to the lifecycle function to allow
 * for further branching.
 * @type {import('./internal').isolateLifecycle<any>}
 */
function isolateLifecycle(source, name, fn) {
  const isolate = new GasketTrace(source._proxy);

  return (...args) => {
    const [event] = args;
    isolate._tracer.traceLifecycleStart(name, event);
    const result = fn(
      // @ts-expect-error - isolate is a Gasket proxy
      isolate._proxy,
      ...args
    );
    if (typeof result?.finally === 'function') {
      return result.finally(() => {
        isolate._tracer.traceLifecycleEnd(name, event);
      });
    }
    isolate._tracer.traceLifecycleEnd(name, event);
    return result;
  };
}

/**
 * Wrap an action function to trace start and end.
 * An isolate passed to the action function to allow
 * for further branching.
 * @type {import('./internal').isolateAction<any>}
 */
function isolateAction(source, name, fn) {
  const isolate = new GasketTrace(source._proxy);

  return (...args) => {
    isolate._tracer.traceActionStart(name);
    const result = fn(
      // @ts-expect-error - isolate is a Gasket proxy
      isolate._proxy,
      ...args
    );
    if (typeof result?.finally === 'function') {
      return result.finally(() => {
        isolate._tracer.traceActionEnd(name);
      });
    }
    isolate._tracer.traceActionEnd(name);
    return result;
  };
}

/**
 * Create a proxy of actions to intercept the functions
 * and return an isolated version.
 * @type {import('./internal').interceptActions}
 */
function interceptActions(source, actions) {
  return new Proxy(actions, {
    get(target, prop) {
      if (prop in target && typeof prop === 'string') {
        return isolateAction(source, prop, target[prop]);
      }
      return actions[prop];
    }
  });
}

/**
 *
 * @type {import('./internal').makeBranch}
 */
export function makeBranch(gasket) {
  const instance = new GasketTrace(gasket, GasketTrace._nextBranchId++);
  // return instance;
  return instance._proxy;
}
