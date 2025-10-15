import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'module';
import { gasketBin } from '../lib/cli';
import { processCommand } from '../lib/utils/process-command';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

describe('cli', () => {
  it('should have a gasketBin property', () => {
    assert.equal(typeof gasketBin, 'object');
  });

  it('should have a name property', () => {
    assert.equal(gasketBin.name(), 'gasket');
  });

  it('should have a description property', () => {
    assert.equal(gasketBin.description(), 'CLI for custom Gasket commands');
  });

  it('should have a version property', () => {
    assert.equal(gasketBin.version(), version);
  });

  it('should have a processCommand property', () => {
    assert.equal(typeof processCommand, 'function');
  });
});
