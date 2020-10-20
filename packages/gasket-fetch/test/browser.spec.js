import { describe, it } from 'mocha';

import fetch from '../browser';
const { AbortController, Request, Headers, Response } = fetch;
import { assertExports, assertGet, assertAbort, assertPost } from './utils';

describe('fetch is available in browsers', function () {
  it('exposes default classes', assertExports(Request, Headers, Response));
  it('can fetch resources', assertGet(fetch));
  it('fetch can POST to API', assertPost(fetch));
  it('can abort fetch', assertAbort(fetch, AbortController));
});
