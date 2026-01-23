import { vi } from 'vitest';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');
const { name, version, devDependencies } = packageJson;

import plugin from '../lib/index.js';
const { create } = plugin.hooks;

describe('the create hook', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      useDocs: true,
      pkg: {
        add: vi.fn()
      },
      readme: {
        subHeading: vi.fn().mockReturnThis(),
        content: vi.fn().mockReturnThis(),
        codeBlock: vi.fn().mockReturnThis()
      },
      gasketConfig: {
        addCommand: vi.fn()
      }
    };
  });

  it('does nothing if useDocs is false', () => {
    create({}, { ...mockContext, useDocs: false });
    expect(mockContext.pkg.add).not.toHaveBeenCalled();
    expect(mockContext.gasketConfig.addCommand).not.toHaveBeenCalled();
  });

  it('adds devDependencies', () => {
    create({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('devDependencies', {
      [name]: `^${version}`,
      '@gasket/plugin-metadata': devDependencies['@gasket/plugin-metadata']
    });
  });

  it('adds docs to the gasket file', () => {
    create({}, mockContext);
    expect(mockContext.gasketConfig.addCommand).toHaveBeenCalledWith('docs', {
      dynamicPlugins: [
        `${name}`,
        '@gasket/plugin-metadata'
      ]
    });
  });

  it('should add a docs script', () => {
    create({}, mockContext);

    expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
      docs: 'node gasket.js docs'
    });
  });

  it('should add a docs script for typescript', () => {
    create({}, { ...mockContext, typescript: true });

    expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
      docs: 'tsx gasket.ts docs'
    });
  });

  it('should add a README section', () => {
    create({}, mockContext);
    expect(mockContext.readme.subHeading).toHaveBeenCalledWith('Documentation');
    expect(mockContext.readme.content).toHaveBeenCalledWith('Generated docs will be placed in the `.docs` directory. To generate markdown documentation for the API, run:');
    expect(mockContext.readme.codeBlock).toHaveBeenCalledWith('{{{packageManager}}} run docs', 'bash');
  });
});
