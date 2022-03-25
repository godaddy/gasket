import { fetch } from '@gasket/fetch';
import { AbortController } from '@gasket/fetch';

describe('@gasket/fetch', function () {
  const perform = false;

  it('has expected API', function () {
    if (perform) {
      fetch('url', { method: 'POST' });
      // @ts-ignore-error
      fetch(123);
      // @ts-ignore-error
      fetch('url', { bogus: true });
    }
  });

  it('exposes AbortController', function () {
    if (perform) {
      const controller = new AbortController();
      const signal: AbortSignal = controller.signal;
    }
  });
});
