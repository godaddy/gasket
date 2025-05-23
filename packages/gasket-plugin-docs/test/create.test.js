const { hooks: { create } } = require('../lib/index');
const { name, version, devDependencies } = require('../package.json');

describe('the create hook', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      useDocs: true,
      pkg: {
        add: jest.fn()
      },
      readme: {
        subHeading: jest.fn().mockReturnThis(),
        content: jest.fn().mockReturnThis(),
        codeBlock: jest.fn().mockReturnThis()
      },
      gasketConfig: {
        addCommand: jest.fn()
      },
      gitignore: {
        add: jest.fn()
      }
    };
  });

  it('does nothing if useDocs is false', () => {
    create({}, { ...mockContext, useDocs: false });
    expect(mockContext.pkg.add).not.toHaveBeenCalled();
    expect(mockContext.gasketConfig.addCommand).not.toHaveBeenCalled();
    expect(mockContext.gitignore.add).not.toHaveBeenCalled();
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

  it('should add a gitignore entry for the .docs directory', () => {
    create({}, mockContext);

    expect(mockContext.gitignore.add).toHaveBeenCalledWith('.docs', 'documentation');
  });

  it('should handle when no `gitignore` is present in the create context', () => {
    expect(() => create({}, mockContext)).not.toThrow(Error);
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
      docs: 'node --import tsx gasket.ts docs'
    });
  });

  it('should add a README section', () => {
    create({}, mockContext);
    expect(mockContext.readme.subHeading).toHaveBeenCalledWith('Documentation');
    expect(mockContext.readme.content).toHaveBeenCalledWith('Generated docs will be placed in the `.docs` directory. To generate markdown documentation for the API, run:');
    expect(mockContext.readme.codeBlock).toHaveBeenCalledWith('{{{packageManager}}} run docs', 'bash');
  });
});
