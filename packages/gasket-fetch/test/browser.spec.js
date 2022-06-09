import { describe, it } from 'mocha';
import assume from 'assume';

import fetch from '../lib/browser';
const { AbortController, Request, Headers, Response } = fetch;
import { assertExports, assertGet, assertAbort, assertPost } from './utils';

describe('fetch is available in browsers', function () {
  it('exposes default classes', assertExports(Request, Headers, Response));
  it('can fetch resources', assertGet(fetch));
  it('fetch can POST to API', assertPost(fetch));
  it('can abort fetch', assertAbort(fetch, AbortController));
  it('uses patched version', function () {
    const original = window.fetch;
    window.fetch = () => 'replaced window.fetch';
    assume(fetch()).equals('replaced window.fetch');
    window.fetch = original;
  });
});
