/**
 * @type {import('./index.js').WeakPromiseKeeper}
 */
// @ts-ignore - https://github.com/microsoft/TypeScript/issues/56664
export class WeakPromiseKeeper extends WeakMap {
  set(key, promise) {
    super.set(key, promise);

    promise
      .then((value) => {
        super.set(key, value);
        return value;
      })
      .catch(() => {
        super.delete(key);
      });

    return this;
  }
}
