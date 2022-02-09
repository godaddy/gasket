const assume = require('assume');
const sinon = require('sinon');

describe('GasketData', function () {
  let getElementByIdStub;

  const getData = () => {
    return require('../lib/index');
  };

  beforeEach(function () {
    getElementByIdStub = sinon.stub(global.document, 'getElementById');
  });

  afterEach(function () {
    delete require.cache[require.resolve('../lib/index')];
    sinon.restore();
  });

  it('returns parsed JSON data parsed', function () {
    getElementByIdStub.returns({ textContent: '{"fake":"results"}' });
    const results = getData();
    assume(results).eqls({ fake: 'results' });
  });

  it('returns undefined if no element found', function () {
    getElementByIdStub.returns();
    const results = getData();
    assume(results).undefined();
  });

  it('returns empty string if no script content', function () {
    getElementByIdStub.returns({ textContent: '' });
    const results = getData();
    assume(results).eqls('');
  });
});
