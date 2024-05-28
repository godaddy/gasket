import { gasketBin, processCommand } from '../lib/cli.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { version } = require('../package.json');

describe('cli', () => {

  it('should have a gasketBin property', () => {
    expect(gasketBin).toEqual(expect.any(Object));
  });

  it('should have a name property', () => {
    expect(gasketBin.name()).toEqual('gasket');
  });

  it('should have a description property', () => {
    expect(gasketBin.description()).toEqual('CLI for custom Gasket commands');
  });

  it('should have a version property', () => {
    expect(gasketBin.version()).toEqual(version);
  });

  it('should have a processCommand property', () => {
    expect(processCommand).toEqual(expect.any(Function));
  });
});
