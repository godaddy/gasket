const assume = require('assume');
const sinon = require('sinon');

const utils = require('../lib/utils');

describe('utils', function () {
  const { gatherManifestData } = utils;
  let gasket;

  beforeEach(() => {
    gasket = {
      execWaterfall: sinon.stub().resolves([]),
      config: {
        manifest: {
          name: 'Walter White',
          superpower: 'Chemistry',
          staticOuput: 'path/to/test.json'
        },
        serviceWorker: {
          url: 'sw.js'
        }
      },
      logger: {
        debug: sinon.stub()
      }
    };
  });

  describe('#gatherManifestData', function () {
    it('is a function', function () {
      assume(gatherManifestData).is.a('asyncfunction');
      assume(gatherManifestData).has.length(2);
    });

    it('uses static source when no url supplied', async function () {
      await gatherManifestData(gasket, {});
      assume(gasket.logger.debug.calledOnce).is.true();
      assume(gasket.logger.debug.args[0][0]).eqls('Gathering manifest for static manifest');
    });

    it('uses req url as source', async function () {
      const req = {
        originalUrl: 'www.originalurl.com'
      };
      await gatherManifestData(gasket, { req });
      assume(gasket.logger.debug.calledOnce).is.true();
      assume(gasket.logger.debug.args[0][0]).eqls('Gathering manifest for www.originalurl.com');
    });

    it('calls manifest waterfall', async function () {
      await gatherManifestData(gasket, {});
      assume(gasket.execWaterfall.calledOnce).is.true();
      assume(gasket.execWaterfall.args[0][1].staticOuput).eqls('path/to/test.json');
    });
  });
});
