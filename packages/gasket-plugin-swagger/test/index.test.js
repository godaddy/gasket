const assume = require('assume');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('Swagger Plugin', () => {
  let plugin;
  let readFileStub, writeFileStub, yamlSafeDumpStub, yamlSafeLoadStub, swaggerJSDocStub, oKStub,
    accessStub;

  beforeEach(() => {
    readFileStub = sinon.stub();
    writeFileStub = sinon.stub();
    yamlSafeDumpStub = sinon.stub();
    yamlSafeLoadStub = sinon.stub().resolves({ data: true });
    swaggerJSDocStub = sinon.stub();
    oKStub = sinon.stub();
    accessStub = sinon.stub().resolves();

    plugin = proxyquire('../index', {
      'fs': {
        readFile: readFileStub,
        writeFile: writeFileStub,
        constants: {
          F_OK: oKStub
        },
        access: accessStub
      },
      'swagger-jsdoc': swaggerJSDocStub,
      'js-yaml': {
        safeDump: yamlSafeDumpStub,
        safeLoad: yamlSafeLoadStub
      },
      'util': {
        promisify: (f) => f
      },
      '/path/to/app/swagger.json': { data: true }
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('is an object', () => {
    assume(plugin).is.an('Object');
    assume(plugin).has.length(2);
  });

  it('has expected name', () => {
    assume(plugin).property('name', '@gasket/plugin-swagger');
  });

  it('has expected hooks', () => {
    const expected = [
      'configure',
      'build',
      'express',
      'create'
    ];

    assume(plugin).property('hooks');

    const hooks = Object.keys(plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).lengthOf(expected.length);
  });

  describe('configure hook', () => {

    it('sets expected defaults', () => {
      const results = plugin.hooks.configure({}, {});
      assume(results)
        .eqls({
          swagger: {
            definitionFile: 'swagger.json',
            apiDocsRoute: '/api-docs'
          }
        });
    });

    it('uses specified definitionFile', () => {
      const results = plugin.hooks.configure({}, {
        swagger: { definitionFile: 'dist/api-spec.yaml' }
      });

      assume(results.swagger.definitionFile).equals('dist/api-spec.yaml');
    });

    it('uses specified apiDocsRoute', () => {
      const results = plugin.hooks.configure({}, {
        swagger: { apiDocsRoute: '/api/v2/docs' }
      });

      assume(results.swagger.apiDocsRoute).equals('/api/v2/docs');
    });
  });

  describe('build hook', () => {
    let mockGasket;

    beforeEach(() => {
      mockGasket = {
        logger: {
          info: sinon.stub(),
          warning: sinon.stub()
        },
        config: {
          root: '/path/to/app',
          swagger: {
            definitionFile: 'swagger.json',
            jsdoc: {
              definition: {
                openapi: '3.0.0'
              },
              apis: ['fake.js']
            }
          }
        }
      };
    });

    it('sets up swagger spec', async () => {
      await plugin.hooks.build(mockGasket);
      assume(swaggerJSDocStub).called();
    });

    it('writes spec file', async () => {
      swaggerJSDocStub.returns({ data: true });
      await plugin.hooks.build(mockGasket);
      assume(writeFileStub).calledWith('/path/to/app/swagger.json');
    });

    it('json content for .json definition files', async () => {
      swaggerJSDocStub.returns({ data: true });
      await plugin.hooks.build(mockGasket);
      assume(writeFileStub.args[0][1]).includes('"data": true');
    });

    it('yaml content for .yaml definition files', async () => {
      swaggerJSDocStub.returns({ data: true });
      mockGasket.config.swagger.definitionFile = 'swagger.yaml';
      yamlSafeDumpStub.returns('- data: true');
      await plugin.hooks.build(mockGasket);
      assume(writeFileStub.args[0][1]).includes('- data: true');
    });

    it('does not setup swagger spec if not configured', async () => {
      delete mockGasket.config.swagger.jsdoc;
      await plugin.hooks.build(mockGasket);
      assume(swaggerJSDocStub).not.called();
    });
  });

  describe('express hook', () => {
    let mockGasket, mockApp;

    beforeEach(() => {
      mockGasket = {
        logger: {
          info: sinon.stub(),
          error: sinon.stub()
        },
        config: {
          root: '/path/to/app',
          swagger: {
            definitionFile: 'swagger.json',
            apiDocsRoute: '/api-docs'
          }
        }
      };
      mockApp = {
        use: sinon.stub()
      };
    });

    context('when target definition file is not found', () => {
      it('returns nothing', async () => {
        mockGasket.config.swagger.definitionFile = 'swagger.yaml';
        const result = await plugin.hooks.express.handler(mockGasket, mockApp);
        assume(result).is.falsely();
      });
    });

    context('when swagger file is missing', () => {
      it('gasket.logger logs error', async () => {
        mockGasket.config.swagger.definitionFile = 'swagger.yaml';
        accessStub.rejects();
        await plugin.hooks.express.handler(mockGasket, mockApp);
        assume(mockGasket.logger.error).calledWith(`Missing ${mockGasket.config.swagger.definitionFile} file...`);
      });
    });

    it('loads the swagger spec yaml file', async () => {
      mockGasket.config.swagger.definitionFile = 'swagger.yaml';
      await plugin.hooks.express.handler(mockGasket, mockApp);
      assume(yamlSafeLoadStub).called();
    });

    it('only loads the swagger spec file once', async () => {
      mockGasket.config.swagger.definitionFile = 'swagger.yaml';
      assume(yamlSafeLoadStub).not.called();
      await plugin.hooks.express.handler(mockGasket, mockApp);
      assume(yamlSafeLoadStub).called(1);
      await plugin.hooks.express.handler(mockGasket, mockApp);
      assume(yamlSafeLoadStub).called(1);
    });

    it('loads the swagger spec json file', async () => {
      await plugin.hooks.express.handler(mockGasket, mockApp);
      assume(yamlSafeLoadStub).not.called();
    });

    it('sets the api docs route', async () => {
      await plugin.hooks.express.handler(mockGasket, mockApp);
      assume(mockApp.use).calledWith('/api-docs');
    });
  });
});
