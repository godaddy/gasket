import webpackConfigHook from '../lib/webpack-config';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name } = require('../package');

describe('webpackConfig', function () {
  let mockGasket, mockWebpackConfig;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: '/path/to/root'
      }
    };
    mockWebpackConfig = {
      resolve: {
        alias: {}
      },
      plugins: []
    };
  });

  it('add alias for plugin', () => {
    const results = webpackConfigHook(mockGasket, mockWebpackConfig);
    expect(results.resolve.alias).toEqual(expect.objectContaining({
      [name]: false
    }));
  });
});
