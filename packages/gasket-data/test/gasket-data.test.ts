import { describe, it, beforeAll, beforeEach, afterEach, vi, expect } from 'vitest';

describe('gasketData', () => {
  let getElementByIdStub: ReturnType<typeof vi.fn>;

  const importFunction = async () => {
    return import('../src/gasket-data').then(mod => mod.gasketData);
  };

  beforeAll(() => {
    Object.defineProperty(global, 'document', {
      writable: true,
      value: {}
    });
    Object.defineProperty(global.document, 'getElementById', {
      writable: true,
      value: vi.fn()
    });
  });

  beforeEach(() => {
    getElementByIdStub = vi.spyOn(global.document, 'getElementById');
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('returns parsed JSON data', async () => {
    getElementByIdStub.mockReturnValueOnce({ textContent: '{"fake":"results"}' });
    const gasketData = await importFunction();
    const results = gasketData();
    expect(results).toEqual({ fake: 'results' });
  });

  it('returns {} if no element found', async () => {
    getElementByIdStub.mockReturnValueOnce(void 0);
    const gasketData = await importFunction();
    const results = gasketData();
    expect(results).toEqual({});
  });

  it('returns {} if no script content', async () => {
    getElementByIdStub.mockReturnValueOnce({ textContent: '' });
    const gasketData = await importFunction();
    const results = gasketData();
    expect(results).toEqual({});
  });

  it('returns undefined and logs error if no document (server)', async () => {
    Object.defineProperty(global, 'document', {
      value: void 0
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    const gasketData = await importFunction();
    const results = gasketData();
    expect(results).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith('gasketData() called on server side');
  });
});
