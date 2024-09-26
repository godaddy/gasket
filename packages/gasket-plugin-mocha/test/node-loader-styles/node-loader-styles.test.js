const { resolve, load } = require('../../lib/node-loader-styles/index.js');
const path = require('path');

describe('resolve', () => {
  it('should return a URL for CSS-related files', () => {
    const result = resolve('./test.css', {}, () => {});
    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('shortCircuit', true);
  });

  it('should call defaultResolve for non-CSS-related files', () => {
    const defaultResolve = jest.fn();
    resolve('./test.js', {}, defaultResolve);
    expect(defaultResolve).toHaveBeenCalled();
  });
});

describe('load', () => {
  it('should return a module format for the empty-module.js file', () => {
    const result = load(path.resolve(__dirname, 'empty-module.js'), {}, () => {});
    expect(result).toHaveProperty('format', 'module');
    expect(result).toHaveProperty('source', 'export default {};');
    expect(result).toHaveProperty('shortCircuit', true);
  });

  it('should call defaultLoad for non-empty-module.js files', () => {
    const defaultLoad = jest.fn();
    load('./test.js', {}, defaultLoad);
    expect(defaultLoad).toHaveBeenCalled();
  });
});
