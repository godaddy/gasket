import debugPkg from 'debug';
import { lifecycleMethods } from './engine.js';

/**
 * Lookup map for lifecycles method names.
 * Using object[key] is fastest
 * @see https://jsben.ch/pm4cd
 * @type {{[p: string]: boolean}}
 */
const lifecycles = Object.fromEntries(lifecycleMethods.map(method => [method, true]));

const reSync = /sync$/i;
const icon = (type) => reSync.test(type) ? '◆' : '◇';

/** @type {import('@gasket/core').Tracer} */
class Tracer {
  /**
   * @param {import('@gasket/core').Tracer | undefined} parent
   * @param {number} branchId
   */
  constructor(parent, branchId) {
    // make a stack copy for each isolate to avoid contamination
    this.traceStack = [...(parent?.traceStack ?? [])];
    const _debug = debugPkg(`gasket:trace:${branchId}`);
    this.trace = (message) => {
      const indent = '  '.repeat(this.traceStack.length);
      _debug(`${indent}${message}`);
    };
  }

  /** @type {import('@gasket/core').Tracer['traceHookStart']} */
  traceHookStart = (pluginName, event) => {
    this.trace(`↪ ${pluginName}:${event}`);
  };

  /** @type {import('@gasket/core').Tracer['traceLifecycleStart']} */
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

  /** @type {import('@gasket/core').Tracer['traceActionStart']} */
  traceActionStart = (name) => {
    this.traceStack.push(name);
    this.trace(`★ ${name}`);
  };

  /** @type {import('@gasket/core').Tracer['traceLifecycleEnd']} */
  // eslint-disable-next-line no-unused-vars
  traceLifecycleEnd = (type, event) => {
    // TODO: not implemented
    // const name = `${type}(${event})`;
    // this.trace(`x ${name}`);
  };

  /** @type {import('@gasket/core').Tracer['traceActionEnd']} */
  // eslint-disable-next-line no-unused-vars
  traceActionEnd = (name) => {
    // TODO: not implemented
    // this.trace(`x ${name}`);
  };
}

/** @type {import('@gasket/core').GasketTrace} */
export class GasketTrace {
  static _nextBranchId = 0;

  /**
   * @param {import('@gasket/core').GasketTrace | import('@gasket/core').Gasket} parent
   * @param {number | null} newBranchId
   */
  constructor(parent, newBranchId = null) {
    this.branchId = newBranchId ?? parent.branchId;
    this.engine = parent.engine;

    this._tracer = new Tracer(parent._tracer, this.branchId);

    if (newBranchId) {
      const parentId = parent.branchId ?? 'root';
      this._tracer.trace(`⋌ ${parentId}`);
    }

    const self = this;

    // @ts-ignore: Proxy merges GasketTrace and Gasket dynamically at runtime
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

    this.traceHookStart = this._tracer.traceHookStart;
    this.trace = this._tracer.trace;

    this.traceRoot = () => {
      if ('config' in parent && 'hook' in parent && 'engine' in parent) return parent;
      return parent.traceRoot();
    };
  }

  /** @type {import('@gasket/core').GasketTrace['traceBranch']} */
  traceBranch = () => {
    return makeTraceBranch(this._proxy);
  };
}

/**
 * Wrap a lifecycle function to trace start and end.
 * A GasketTrace instance is passed to the lifecycle function
 * to allow for tracing and further branching.
 * @type {import('.').isolateLifecycle<any>}
 */
function isolateLifecycle(source, name, fn) {
  const instance = new GasketTrace(source._proxy);

  return (...args) => {
    let event;
    if (typeof args[0] === 'string') {
      event = args[0];
    } else if (typeof args[1] === 'string') {
      event = args[1];
    } else {
      event = 'unknown';
    }
    const stringEvent = /** @type {string} */ (event);

    instance._tracer.traceLifecycleStart(name, stringEvent);
    const result = fn(
      instance._proxy,
      ...args
    );
    if (typeof result?.finally === 'function') {
      return result.finally(() => {
        instance._tracer.traceLifecycleEnd(name, stringEvent);
      });
    }
    instance._tracer.traceLifecycleEnd(name, stringEvent);
    return result;
  };
}

/**
 * Wrap an action function to trace start and end.
 * A GasketTrace instance is passed to the action function
 * to allow for tracing and further branching.
 * @type {import('.').isolateAction<any>}
 */
function isolateAction(source, name, fn) {
  const instance = new GasketTrace(source._proxy);

  return (...args) => {
    instance._tracer.traceActionStart(name);
    const result = fn(
      instance._proxy,
      ...args
    );
    if (typeof result?.finally === 'function') {
      return result.finally(() => {
        instance._tracer.traceActionEnd(name);
      });
    }
    instance._tracer.traceActionEnd(name);
    return result;
  };
}

/**
 * Create a proxy of actions to intercept the functions
 * and return a traceable version.
 * @type {import('.').interceptActions}
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
 * Create a new GasketTrace instance from a Gasket.
 * @type {import('.').makeTraceBranch}
 */
export function makeTraceBranch(gasket) {
  const instance = new GasketTrace(gasket, GasketTrace._nextBranchId++);
  // return instance;
  return instance._proxy;
}
