const configure = require('../lib/configure');

describe('configure', () => {

  let results, mockGasket;

  beforeEach(() => {
    mockGasket = {
      config: {}
    };
  });

  it('returns config with serviceWorker settings', async () => {
    results = await configure(mockGasket);
    expect(results).toHaveProperty('serviceWorker');
  });

  it('retains base config settings', async () => {
    results = await configure(mockGasket, { bogus: 'BOGUS' });
    expect(results).toHaveProperty('bogus', 'BOGUS');
  });

  it('sets defaults', async () => {
    results = await configure(mockGasket);
    expect(results.serviceWorker).toEqual({
      url: '/sw.js',
      scope: '/',
      content: '',
      cache: {
        maxAge: 1000 * 60 * 60 * 24 * 5, // 5 days
        updateAgeOnGet: true
      }
    });
  });

  it('allows serviceWorker settings to be customized by user', async () => {
    results = await configure(mockGasket, {
      serviceWorker: {
        url: '/some-sw.js'
      }
    });
    expect(results.serviceWorker).toHaveProperty('url', '/some-sw.js');
  });
});
