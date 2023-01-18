/* eslint-disable jest/expect-expect, jest/no-done-callback */
import 'whatwg-fetch';
import fetch from '../lib/browser';
const { AbortController, Request, Headers, Response } = fetch;
import { assertExports, assertGet, assertAbort, assertPost } from './utils';

describe('fetch is available in browsers', function () {

  it('exposes default classes', assertExports(Request, Headers, Response));
  it('can fetch resources', (done) => {
    assertGet(fetch);
    done();
  });
  it('fetch can POST to API', (done) => {
    assertPost(fetch);
    done();
  });
  it('can abort fetch', assertAbort(fetch, AbortController));
  it('uses patched version', function () {
    const original = window.fetch;
    window.fetch = () => 'replaced window.fetch';
    expect(fetch()).toEqual('replaced window.fetch');
    window.fetch = original;
  });
});
