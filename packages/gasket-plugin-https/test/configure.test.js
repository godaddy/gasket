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
});
