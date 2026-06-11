import { describe, it, expect, beforeEach, vi } from 'vitest';

// Capture the chained proxy server so tests can drive the error handler that
// startProxy registers. createServer().on('error', cb).listen(port) — `on`
// returns the same stub so the chain resolves, and stores cb for invocation.
const mockListen = vi.fn();
const mockOn = vi.fn().mockReturnValue({ listen: mockListen });
const mockProxyCreateServer = vi.fn().mockReturnValue({ on: mockOn });

vi.mock('http-proxy', () => ({
  default: {
    createServer: mockProxyCreateServer
  }
}));

const { getPortFallback, portInUseError, startProxy, getRawServerConfig } = await import('../lib/utils.js');

describe('getPortFallback', () => {
  it('returns 8080 for a local env', () => {
    expect(getPortFallback('local')).toBe(8080);
  });

  it('returns 8080 for any env containing "local"', () => {
    expect(getPortFallback('localhost-dev')).toBe(8080);
  });

  it('returns 80 for a non-local env', () => {
    expect(getPortFallback('production')).toBe(80);
  });

  it('returns 80 when env is omitted', () => {
    expect(getPortFallback()).toBe(80);
  });
});

describe('portInUseError', () => {
  it('detects EADDRINUSE on an http error', () => {
    expect(portInUseError({ http: { code: 'EADDRINUSE' } })).toBe(true);
  });

  it('detects EADDRINUSE on an https error', () => {
    expect(portInUseError({ https: { code: 'EADDRINUSE' } })).toBe(true);
  });

  it('detects EADDRINUSE on an http2 error', () => {
    expect(portInUseError({ http2: { code: 'EADDRINUSE' } })).toBe(true);
  });

  it('reads the first error when given an array', () => {
    expect(portInUseError([{ http: { code: 'EADDRINUSE' } }])).toBe(true);
  });

  it('returns false for a non-port error', () => {
    expect(portInUseError({ https: { code: 'ENOENT' } })).toBe(false);
  });

  it('returns false when the protocol object is absent', () => {
    expect(portInUseError({})).toBe(false);
  });
});

describe('getRawServerConfig', () => {
  it('includes only the protocols present in gasket config', () => {
    const gasket = { config: { hostname: 'localhost', root: '/app', http: 8080 } };

    const result = getRawServerConfig(gasket);

    expect(result).toEqual({ hostname: 'localhost', root: '/app', http: 8080 });
    expect(result).not.toHaveProperty('https');
    expect(result).not.toHaveProperty('http2');
  });

  it('carries https and http2 when configured', () => {
    const gasket = {
      config: { hostname: 'localhost', root: '/app', https: { port: 443 }, http2: { port: 8443 } }
    };

    const result = getRawServerConfig(gasket);

    expect(result.https).toEqual({ port: 443 });
    expect(result.http2).toEqual({ port: 8443 });
    expect(result).not.toHaveProperty('http');
  });
});

describe('startProxy', () => {
  let logger;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOn.mockReturnValue({ listen: mockListen });
    logger = { info: vi.fn(), error: vi.fn() };
  });

  it('starts a proxy on the configured port and logs the address', () => {
    startProxy({ protocol: 'https', hostname: 'app.local', port: 9000 }, logger);

    expect(mockListen).toHaveBeenCalledWith(9000);
    expect(logger.info).toHaveBeenCalledWith('Proxy server started: https://app.local:9000');
  });

  it('applies protocol/hostname/port defaults when omitted', () => {
    startProxy({}, logger);

    expect(mockListen).toHaveBeenCalledWith(8080);
    expect(logger.info).toHaveBeenCalledWith('Proxy server started: http://localhost:8080');
  });

  it('forwards proxy options without the address fields', () => {
    startProxy({ port: 9000, target: 'http://localhost:5000' }, logger);

    expect(mockProxyCreateServer).toHaveBeenCalledWith({ target: 'http://localhost:5000' });
  });

  it('logs proxy request failures via the error handler', () => {
    startProxy({ port: 9000 }, logger);

    // Invoke the handler registered with `.on('error', ...)` to exercise it.
    const [event, handler] = mockOn.mock.calls[0];
    const proxyError = new Error('upstream down');
    handler(proxyError);

    expect(event).toBe('error');
    expect(logger.error).toHaveBeenCalledWith('Request failed to proxy:', proxyError);
  });
});
