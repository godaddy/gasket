
import { WeakPromiseKeeper } from '../lib/keeper.js';
import { setTimeout } from 'node:timers/promises';

function resolvablePromise() {
  let resolve, reject;
  const promise = new Promise((doResolve, doReject) => {
    resolve = doResolve;
    reject = doReject;
  });

  return { promise, resolve, reject };
}

describe('WeakPromiseKeeper', () => {
  let keeper, key;
  beforeEach(() => {
    key = Symbol('key');
    keeper = new WeakPromiseKeeper();
  });

  it('should return a WeakPromiseKeeper instance', () => {
    expect(keeper).toBeInstanceOf(WeakPromiseKeeper);
    // which extend WeakMap
    expect(keeper).toBeInstanceOf(WeakMap);
  });

  it('should have expected methods', () => {
    expect(keeper).toHaveProperty('set');
    expect(keeper).toHaveProperty('get');
    expect(keeper).toHaveProperty('has');
  });

  it('should return a promise', async () => {
    const { promise } = resolvablePromise();

    keeper.set(key, promise);
    expect(keeper.get(key)).toBeInstanceOf(Promise);
    expect(keeper.get(key)).toBe(promise);
  });

  it('should return a value when promised resolved', async () => {
    const { promise, resolve } = resolvablePromise();

    keeper.set(key, promise);
    expect(keeper.get(key)).toBe(promise);

    await resolve('test');
    expect(keeper.get(key)).toBe('test');
  });

  it('should remove key if promise rejected', async () => {
    const { promise, reject } = resolvablePromise();
    const mockError = new Error('test');

    keeper.set(key, promise);
    expect(keeper.get(key)).toBe(promise);

    expect(keeper.has(key)).toBe(true);

    reject(mockError);
    await setTimeout(10);

    expect(keeper.has(key)).toBe(false);
  });
});
