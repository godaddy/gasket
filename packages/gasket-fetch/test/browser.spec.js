import 'whatwg-fetch';
import { describe, it } from 'mocha';

import fetch, { AbortController, Request, Headers, Response } from '../browser';
import { assertExports, assertGet, assertAbort, assertPost } from './utils';

describe('fetch is available in browsers', function () {
  it('exposes default classes', assertExports(Request, Headers, Response));
  it('can fetch resources', assertGet(fetch));
  it('fetch can POST to API', assertPost(fetch));
  it('can abort fetch', assertAbort(fetch, AbortController));
});
