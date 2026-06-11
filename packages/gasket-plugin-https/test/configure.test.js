import { describe, it, expect, beforeEach } from 'vitest';
import configure from '../lib/configure.js';

describe('configure', () => {
  let mockCreateContext;

  beforeEach(() => {
    mockCreateContext = {
      root: '/path/to/root',
      https: {
        port: 443
      },
      http2: {
        port: 443
      }
    };
  });

  it('sets root on https config', () => {
    const result = configure({}, mockCreateContext);

    expect(result.https.root).toBe('/path/to/root');
  });

  it('sets root on http2 config', () => {
    const result = configure({}, mockCreateContext);

    expect(result.http2.root).toBe('/path/to/root');
  });

  it('does not overwrite an explicitly configured root', () => {
    mockCreateContext.https.root = '/custom/https/root';

    const result = configure({}, mockCreateContext);

    expect(result.https.root).toBe('/custom/https/root');
  });

  it('sets root on each entry of an array server config', () => {
    mockCreateContext.https = [{ port: 8443 }, { port: 9443 }];

    const result = configure({}, mockCreateContext);

    expect(result.https[0].root).toBe('/path/to/root');
    expect(result.https[1].root).toBe('/path/to/root');
  });

  it('preserves a per-entry root already set within an array config', () => {
    mockCreateContext.https = [{ port: 8443, root: '/explicit' }, { port: 9443 }];

    const result = configure({}, mockCreateContext);

    expect(result.https[0].root).toBe('/explicit');
    expect(result.https[1].root).toBe('/path/to/root');
  });

  it('leaves config untouched when https and http2 are absent', () => {
    const result = configure({}, { root: '/path/to/root' });

    expect(result.https).toBeUndefined();
    expect(result.http2).toBeUndefined();
  });
});
