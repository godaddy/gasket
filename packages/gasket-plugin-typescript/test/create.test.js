const create = require('../lib/create');
const { devDependencies } = require('../package.json');

describe('create hook', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      apiApp: false,
      gitignore: {
        add: jest.fn()
      },
      pkg: {
        add: jest.fn()
      },
      files: {
        add: jest.fn()
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('adds devDependencies to package.json for api apps', () => {
    mockContext.apiApp = true;
    create({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('devDependencies', {
      tsx: devDependencies.tsx,
      typescript: devDependencies.typescript
    });
  });

  it('adds dependencies to package.json for next apps', () => {
    create({}, mockContext);
    expect(mockContext.pkg.add).toHaveBeenCalledWith('dependencies', {
      tsx: devDependencies.tsx,
      typescript: devDependencies.typescript
    });
  });


  describe('apiApp', () => {
    it('adds scripts to package.json', () => {
      mockContext.apiApp = true;
      create({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        prebuild: 'tsx gasket.ts build',
        build: 'tsc',
        start: 'node dist/server.js',
        local: 'GASKET_ENV=local tsx watch server.ts'
      });
    });

    it('adds files for API apps', () => {
      mockContext.apiApp = true;
      create({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(expect.stringMatching(/generator\/api\/\*$/), expect.stringMatching(/generator\/shared\/\*$/));
    });

    it('adds gitignore for API apps', () => {
      mockContext.apiApp = true;
      create({}, mockContext);
      expect(mockContext.gitignore.add).toHaveBeenCalledWith('dist', 'TypeScript build output');
    });

    it('adds to eslintIgnore for API apps', () => {
      mockContext.apiApp = true;
      create({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('eslintIgnore', ['dist']);
    });
  });

  describe('nextServerType', () => {
    it('adds files for customServer', () => {
      mockContext.nextServerType = 'customServer';
      create({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(expect.stringMatching(/generator\/next\/\*$/), expect.stringMatching(/generator\/shared\/\*$/));
    });

    it('adds files for defaultServer w/o dev proxy', () => {
      mockContext.nextDevProxy = false
      create({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(expect.stringMatching(/generator\/next\/\*\(tsconfig\).json$/));
    });

    it('adds gitignore for customServer', () => {
      mockContext.nextServerType = 'customServer';
      create({}, mockContext);
      expect(mockContext.gitignore.add).toHaveBeenCalledWith('dist', 'TypeScript build output');
    });

    it('adds to eslintIgnore for customServer', () => {
      mockContext.nextServerType = 'customServer';
      create({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('eslintIgnore', ['dist']);
    });
  });

  describe('nextDevProxy', () => {
    it('adds files for dev proxy w/o customServer', () => {
      mockContext.nextDevProxy = true;
      create({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(expect.stringMatching(/generator\/next\/\*\(tsconfig\).json$/), expect.stringMatching(/generator\/shared\/\*$/));
    });
  });
});
