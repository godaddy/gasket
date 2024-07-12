const { load } = require('../../lib/node-loader-babel/index.js');
const babel = require('@babel/core');

jest.mock('@babel/core', () => ({
  transformAsync: jest.fn(),
  loadOptionsAsync: jest.fn()
}));

describe('load function', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return defaultLoad result if useLoader returns false', async () => {
    const defaultLoad = jest.fn().mockResolvedValue('defaultLoadResult');
    const result = await load('/node_modules/', {}, defaultLoad);
    expect(result).toBe('defaultLoadResult');
  });

  it('should set context.format to module for .ts and .tsx files', async () => {
    const defaultLoad = jest.fn().mockResolvedValue({ source: 'source', format: 'format' });
    const context = {};
    await load('url.ts', context, defaultLoad);
    expect(context.format).toBe('module');
  });

  it('should return defaultLoad result if source is falsy', async () => {
    const defaultLoad = jest.fn().mockResolvedValue({ source: null, format: 'format' });
    const result = await load('url', {}, defaultLoad);
    expect(result).toEqual({ source: null, format: 'format' });
  });

  it('should return defaultLoad result if format is not supported', async () => {
    const defaultLoad = jest.fn().mockResolvedValue({ source: 'source', format: 'unsupported' });
    const result = await load('url', {}, defaultLoad);
    expect(result).toEqual({ source: 'source', format: 'unsupported' });
  });

  it('should transform source with babel for supported formats', async () => {
    const defaultLoad = jest.fn().mockResolvedValue({ source: 'source', format: 'module' });
    babel.transformAsync.mockResolvedValue({ code: 'transformedCode' });
    babel.loadOptionsAsync.mockResolvedValue({});
    const url = 'file:///pages/index.js';
    const result = await load(url, {}, defaultLoad);
    expect(babel.transformAsync).toHaveBeenCalledWith('source', expect.any(Object));
    expect(result).toEqual({ source: 'transformedCode', format: 'module' });
  });

  it('should transform source with babel when the file is a babel config', async () => {
    const defaultLoad = jest.fn().mockResolvedValue({ source: 'source', format: 'module' });
    const url = 'file:///pages/.babelrc';
    const result = await load(url, {}, defaultLoad);
    expect(babel.transformAsync).not.toHaveBeenCalled();
    expect(babel.loadOptionsAsync).not.toHaveBeenCalled();
    expect(result).toEqual({ source: 'source', format: 'json' });
  });
});
