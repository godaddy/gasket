import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import create from '../lib/create.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { name, version } = require('../package.json');

describe('create', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: mock.fn()
      },
      gasketConfig: {
        addPlugin: mock.fn()
      }
    };
  });

  it('should be a function', () => {
    assert.equal(typeof create, 'function');
  });

  it('should add pluginCommand to gasketConfig', () => {
    create({}, mockContext);
    assert.equal(mockContext.gasketConfig.addPlugin.mock.calls.length, 1);
    assert.deepEqual(mockContext.gasketConfig.addPlugin.mock.calls[0].arguments, ['pluginCommand', name]);
  });

  it('should add dependency to pkg', () => {
    create({}, mockContext);
    assert.equal(mockContext.pkg.add.mock.calls.length, 1);
    assert.deepEqual(mockContext.pkg.add.mock.calls[0].arguments, ['dependencies', {
      [name]: `^${version}`
    }]);
  });
});
