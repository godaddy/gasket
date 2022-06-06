const Plugin = require('../lib/index');
const assume = require('assume');
const assumeSinon = require('assume-sinon');
const sinon = require('sinon');

assume.use(assumeSinon);

describe('@gasket/plugin-morgan', () => {
  it('is an object', () => {
    assume(Plugin).is.an('object');
  });

  it('has expected name', () => {
    assume(Plugin).to.have.property('name', '@gasket/plugin-morgan');
  });

  it('has expected dependencies', () => {
    assume(Plugin).to.have.property('dependencies');
    assume(Plugin.dependencies).to.eqls(['@gasket/plugin-log']);
  });

  it('has expected hooks', () => {
    const expected = [
      'middleware'
    ];

    assume(Plugin).to.have.property('hooks');

    const hooks = Object.keys(Plugin.hooks);
    assume(hooks).eqls(expected);
    assume(hooks).is.length(expected.length);
  });

  describe('.middleware', () => {
    describe('.handler', () => {
      it('runs on the middleware lifecycle event', function () {
        assume(Plugin.hooks.middleware.handler).to.be.a('function');
        assume(Plugin.hooks.middleware.handler).to.have.length(1);
      });

      it('it returns a morgan middleware', () => {
        const loggerMock = { info: sinon.stub() };

        const gasketMock = {
          config: {
            morgan: { format: 'tiny', options: {} }
          },
          logger: loggerMock
        };

        const returnValue = Plugin.hooks.middleware.handler(gasketMock);
        assume(returnValue).to.be.an('array');
        assume(returnValue[0]).to.be.a('function');
        assume(returnValue[0].length).to.eql(3);
      });

      it('logs requests using gasket logger', (done) => {
        const loggerMock = { info: sinon.stub() };
        const reqMock = { method: 'GET', url: '/foobar' };
        const resMock = {};

        const gasketMock = {
          config: {
            morgan: { format: ':method :url', options: { immediate: true } }
          },
          logger: loggerMock
        };

        const [morganMiddleware] = Plugin.hooks.middleware.handler(gasketMock);
        morganMiddleware(reqMock, resMock, function next() { // eslint-disable-line max-nested-callbacks
          assume(loggerMock.info).to.have.been.calledWith('GET /foobar');
          done();
        });
      });
    });
  });
});
