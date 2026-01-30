import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyAdapter } from '../lib/adapters/base-adapter.js';
import { FastifyV4Adapter } from '../lib/adapters/fastify-v4-adapter.js';
import { FastifyV5Adapter } from '../lib/adapters/fastify-v5-adapter.js';
import { detectFastifyVersion, createFastifyAdapter } from '../lib/adapters/adapter-factory.js';

describe('Base Adapter', () => {
  it('cannot be instantiated directly', () => {
    expect(() => new FastifyAdapter()).toThrow('FastifyAdapter is an abstract class');
  });

  it('must implement createInstance in subclasses', () => {
    class TestAdapter extends FastifyAdapter {}

    const adapter = new TestAdapter();
    expect(() => adapter.createInstance({})).toThrow('createInstance() must be implemented by subclass');
  });
});

describe('Fastify v4 Adapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new FastifyV4Adapter();
  });

  it('aligns logger with fatal and trace levels', () => {
    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    };

    const aligned = adapter.alignLogger(mockLogger);

    expect(aligned.fatal).toBe(mockLogger.error);
    expect(aligned.trace).toBe(mockLogger.debug);
  });

  it('preserves existing fatal and trace levels', () => {
    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      fatal: vi.fn(),
      trace: vi.fn()
    };

    const aligned = adapter.alignLogger(mockLogger);

    expect(aligned.fatal).toBe(mockLogger.fatal);
    expect(aligned.trace).toBe(mockLogger.trace);
  });

  it('creates Fastify instance with v4 configuration', () => {
    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(() => mockLogger)
    };

    const config = {
      trustProxy: true,
      disableRequestLogging: false
    };

    const instance = adapter.createInstance(config, mockLogger);

    // Verify instance was created
    expect(instance).toBeDefined();
    expect(instance.server).toBeDefined();
  });
});

describe('Fastify v5 Adapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new FastifyV5Adapter();
  });

  it('aligns logger with fatal and trace levels', () => {
    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    };

    const aligned = adapter.alignLogger(mockLogger);

    expect(aligned.fatal).toBe(mockLogger.error);
    expect(aligned.trace).toBe(mockLogger.debug);
  });

  it('creates Fastify instance with v5 configuration', () => {
    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(() => mockLogger)
    };

    const config = {
      trustProxy: true,
      disableRequestLogging: false,
      useSemicolonDelimiter: false
    };

    const instance = adapter.createInstance(config, mockLogger);

    // Verify instance was created
    expect(instance).toBeDefined();
    expect(instance.server).toBeDefined();
  });
});

describe('Adapter Factory', () => {
  let detectedVersion;

  beforeEach(() => {
    detectedVersion = detectFastifyVersion();
  });

  it('detects Fastify version from package.json', () => {
    const version = detectFastifyVersion();
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('creates correct adapter for installed Fastify version', () => {
    const adapter = createFastifyAdapter();
    const majorVersion = parseInt(detectedVersion.split('.')[0], 10);

    if (majorVersion === 4) {
      expect(adapter).toBeInstanceOf(FastifyV4Adapter);
    } else if (majorVersion === 5) {
      expect(adapter).toBeInstanceOf(FastifyV5Adapter);
    } else {
      throw new Error(`Unexpected Fastify version: ${detectedVersion}`);
    }
  });

  it('adapter provides createInstance method', () => {
    const adapter = createFastifyAdapter();
    expect(typeof adapter.createInstance).toBe('function');
  });
});
