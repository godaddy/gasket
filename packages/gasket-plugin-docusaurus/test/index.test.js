import plugin from '../lib/index.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { name, version, description } = require('../package.json');

describe('Plugin', () => {

  it('is an object', () => {
    expect(typeof plugin).toEqual('object');
  });

  it('has expected properties', () => {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });

  it('has expected hooks', () => {
    const expected = [
      'configure',
      'docsView',
      'webpackConfig',
      'metadata'
    ];
    expect(Object.keys(plugin.hooks)).toEqual(expected);
    expect(Object.keys(plugin.hooks)).toHaveLength(expected.length);
  });
});
