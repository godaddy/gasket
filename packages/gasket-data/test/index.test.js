describe('GasketData', function () {
  let getElementByIdStub;

  const getData = () => {
    return require('../lib/index');
  };

  beforeAll(() => {
    Object.defineProperty(global, 'document', {
      writable: true,
      value: {}
    });
    Object.defineProperty(global.document, 'getElementById', {
      writable: true,
      value: jest.fn()
    });
  });

  beforeEach(function () {
    getElementByIdStub = jest.spyOn(global.document, 'getElementById');
  });

  afterEach(function () {
    jest.resetModules();
  });

  it('returns parsed JSON data parsed', function () {
    getElementByIdStub.mockReturnValueOnce({ textContent: '{"fake":"results"}' });
    const results = getData();
    expect(results).toEqual({ fake: 'results' });
  });

  it('returns undefined if no element found', function () {
    getElementByIdStub.mockReturnValueOnce();
    const results = getData();
    expect(results).toBeUndefined();
  });

  it('returns empty string if no script content', function () {
    getElementByIdStub.mockReturnValueOnce({ textContent: '' });
    const results = getData();
    expect(results).toEqual('');
  });
});
