const path = require('path');
const configure = require('../lib/configure');

describe('configure', () => {

  let results, mockGasket;

  beforeEach(() => {
    mockGasket = {
      config: {
        root: '/path/to/app'
      }
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

  it('configures absolute staticOutput path', async () => {
    results = await configure(mockGasket, {
      serviceWorker: {
        staticOutput: './some/path.js'
      }
    });
    expect(results.serviceWorker).toHaveProperty('staticOutput', path.join(mockGasket.config.root, '/some/path.js'));
  });

  it('configures staticOutput path if true', async () => {
    results = await configure(mockGasket, {
      serviceWorker: {
        staticOutput: true
      }
    });
    expect(results.serviceWorker).toHaveProperty('staticOutput', path.join(mockGasket.config.root, '/public/sw.js'));
  });
});
