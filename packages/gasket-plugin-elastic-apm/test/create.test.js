import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import create from '../lib/create.js';
import { readFileSync } from 'fs';

const packageJsonPath = new URL('../package.json', import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const { name, version, devDependencies } = pkg;

describe('create lifecycle', function () {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      pkg: {
        add: vi.fn(),
        extend: vi.fn().mockImplementation((fn) => fn({ scripts: { start: 'node server.js' } }))
      },
      files: {
        add: vi.fn()
      },
      gasketConfig: {
        addPlugin: vi.fn()
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('is a function', () => {
    expect(typeof create).toStrictEqual('function');
  });

  it('adds the plugin to the gasket config', async () => {
    await create({}, mockContext);
    expect(mockContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginElasticApm', name);
  });

  it('adds expected dependencies', async () => {
    await create({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`,
      'dotenv': devDependencies.dotenv,
      'elastic-apm-node': devDependencies['elastic-apm-node']
    });
  });

  it('adds the start script with --import', async () => {
    const result = mockContext.pkg.extend((current) => {
      return {
        scripts: {
          start: `NODE_OPTIONS='--import ./setup.js' ${current.scripts.start}`
        }
      };
    });
    await create({}, mockContext);
    expect(mockContext.pkg.extend).toHaveBeenCalledWith(expect.any(Function));
    expect(result).toEqual({ scripts: { start: 'NODE_OPTIONS=\'--import ./setup.js\' node server.js' } });
  });

  it('adds the generator files', async () => {
    await create({}, mockContext);
    expect(mockContext.files.add).toHaveBeenCalledWith(expect.stringMatching(/generator\/\*$/));
  });
});
