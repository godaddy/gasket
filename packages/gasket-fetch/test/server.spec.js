const { describe, it } = require('mocha');

const fetch = require('../node');
import { assertExports, assertGet, assertAbort, assertPost } from './utils';

const { AbortController, Request, Headers, Response } = fetch;

describe('fetch is available in Node.JS', function () {
  it('exposes default classes', assertExports(Request, Headers, Response));
  it('can fetch resources', assertGet(fetch));
  it('fetch can POST to API', assertPost(fetch));
  it('can abort fetch', assertAbort(fetch, AbortController));
});
