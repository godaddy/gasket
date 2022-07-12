import { fetch } from '@gasket/fetch';

describe('@gasket/fetch', function () {
  const perform = false;

  it('has expected API', function () {
    if (perform) {
      fetch('url', { method: 'POST' });
      // @ts-expect-error
      fetch(123);
      // @ts-expect-error
      fetch('url', { bogus: true });
    }
  });

  it('exposes AbortController', function () {
    if (perform) {
      // @ts-expect-error
      const controller = new fetch.AbortController();
      const signal: AbortSignal = controller.signal;
    }
  });
});
