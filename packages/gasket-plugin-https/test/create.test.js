import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import create from '../lib/create.js';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

const pkg = JSON.parse(readFileSync(join(dirName, '../package.json'), 'utf8'));
const { name, version } = pkg;

describe('create', () => {
  let mockCreateContext;

  beforeEach(() => {
    mockCreateContext = {
      pkg: {
        add: vi.fn()
      },
      gasketConfig: {
        addPlugin: vi.fn()
      }
    };
  });

  it('adds plugin to gasketConfig', async () => {
    await create({}, mockCreateContext);

    expect(mockCreateContext.gasketConfig.addPlugin).toHaveBeenCalledWith('pluginHttps', name);
  });

  it('adds plugin to package.json dependencies', async () => {
    await create({}, mockCreateContext);

    expect(mockCreateContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      [name]: `^${version}`
    });
  });
});
