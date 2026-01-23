const create = require('../lib/create');
const { devDependencies } = require('../package.json');

describe('create hook', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      apiApp: false,
      packageManager: 'npm',
      gitignore: {
        add: jest.fn()
      },
      pkg: {
        add: jest.fn()
      },
      readme: {
        link: jest.fn().mockReturnThis(),
        markdownFile: jest.fn().mockReturnThis()
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

  it('adds links for all apps', () => {
    create({}, mockContext);
    expect(mockContext.readme.link).toHaveBeenCalledWith('tsx', 'https://tsx.is/');
    expect(mockContext.readme.link).toHaveBeenCalledWith('@gasket/plugin-typescript', 'https://gasket.dev/docs/plugins/plugin-typescript/');
    expect(mockContext.readme.link).toHaveBeenCalledWith('Gasket TypeScript', 'https://gasket.dev/docs/typescript/');
  });

  describe('apiApp', () => {
    it('adds scripts to package.json', () => {
      mockContext.apiApp = true;
      create({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        prebuild: 'tsx gasket.ts build',
        build: 'tsc',
        preview: 'npm run build && npm run start',
        start: 'node dist/server.js',
        local: 'tsx watch server.ts'
      });
    });

    it('adds scripts with yarn commands when packageManager is yarn', () => {
      mockContext.apiApp = true;
      mockContext.packageManager = 'yarn';
      create({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        prebuild: 'tsx gasket.ts build',
        build: 'tsc',
        preview: 'yarn build && yarn start',
        start: 'node dist/server.js',
        local: 'tsx watch server.ts'
      });
    });

    it('adds scripts with pnpm commands when packageManager is pnpm', () => {
      mockContext.apiApp = true;
      mockContext.packageManager = 'pnpm';
      create({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('scripts', {
        prebuild: 'tsx gasket.ts build',
        build: 'tsc',
        preview: 'pnpm build && pnpm start',
        start: 'node dist/server.js',
        local: 'tsx watch server.ts'
      });
    });

    it('adds files for API apps', () => {
      mockContext.apiApp = true;
      create({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(expect.stringMatching(/generator\/api\/\*$/), expect.stringMatching(/generator\/shared\/\*$/));
    });

    it('adds to eslintIgnore for API apps', () => {
      mockContext.apiApp = true;
      create({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('eslintIgnore', ['dist']);
    });

    it('adds markdown partial for API apps', () => {
      mockContext.apiApp = true;
      create({}, mockContext);
      expect(mockContext.readme.markdownFile).toHaveBeenCalledWith(expect.stringMatching(/generator\/markdown\/README.md$/));
    });
  });

  describe('nextServerType', () => {
    it('adds files for customServer', () => {
      mockContext.nextServerType = 'customServer';
      create({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(
        expect.stringMatching(/generator\/next\/\*$/),
        expect.stringMatching(/generator\/shared\/\*$/)
      );
    });

    it('adds files for defaultServer w/o dev proxy', () => {
      mockContext.nextDevProxy = false;
      create({}, mockContext);
      expect(mockContext.files.add).toHaveBeenCalledWith(expect.stringMatching(/generator\/next\/\*\(tsconfig\).json$/));
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
      expect(mockContext.files.add).toHaveBeenCalledWith(
        expect.stringMatching(/generator\/next\/\*$/),
        expect.stringMatching(/generator\/shared\/\*$/)
      );
    });

    it('adds concurrently for non-API apps', () => {
      mockContext.apiApp = false;
      create({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('devDependencies', {
        concurrently: devDependencies.concurrently
      });
    });

    it('adds to eslintIgnore for nextDevProxy', () => {
      mockContext.nextServerType = 'appRouter';
      mockContext.nextDevProxy = true;
      create({}, mockContext);
      expect(mockContext.pkg.add).toHaveBeenCalledWith('eslintIgnore', ['dist']);
    });
  });
});
