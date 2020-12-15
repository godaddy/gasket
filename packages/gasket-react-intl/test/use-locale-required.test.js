import assume from 'assume';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import mockManifest from './fixtures/mock-manifest.json';
import { LocaleStatus } from '../src/utils';
const { ERROR, LOADED, LOADING } = LocaleStatus;

// helper to wait for async actions
const pause = ms => new Promise((resolve) => setTimeout(resolve, ms));

describe('useLocaleRequired', function () {
  let mockConfig, mockContext, fetchStub, useLocaleRequired;

  const getModule = () => {
    return proxyquire('../src/use-locale-required', {
      'react': {
        useContext: sinon.stub().returns(mockContext)
      },
      '@gasket/fetch': {
        default: fetchStub
      },
      './config': mockConfig,
      './utils': proxyquire('../src/utils', {
        './config': mockConfig
      })
    });
  };

  beforeEach(function () {
    fetchStub = sinon.stub().resolves({ ok: true, json: () => ({ example: 'Example' }) });

    mockContext = {
      locale: 'en',
      status: {},
      dispatch: sinon.stub()
    };

    mockConfig = {
      defaultLocale: 'en-US',
      manifest: { ...mockManifest, paths: { ...mockManifest.paths } },
      isBrowser: true
    };
    useLocaleRequired = getModule().default;
  });

  afterEach(function () {
    sinon.restore();
  });

  it('fetches locales url if not loaded', function () {
    const results = useLocaleRequired('/locales');
    assume(results).equals(LOADING);
    assume(fetchStub).called();
    assume(fetchStub).calledWith('/locales/en.json');
  });

  it('returns LOADING if fetching', function () {
    const results = useLocaleRequired('/locales');
    assume(results).equals(LOADING);
    assume(fetchStub).called();
  });

  it('returns status if set', function () {
    mockContext.status['/locales/en.json'] = LOADED;
    assume(useLocaleRequired('/locales')).equals(LOADED);

    mockContext.status['/locales/en.json'] = ERROR;
    assume(useLocaleRequired('/locales')).equals(ERROR);

    mockContext.status['/locales/en.json'] = LOADING;
    assume(useLocaleRequired('/locales')).equals(LOADING);
  });

  it('dispatches LOADED action when loaded', async function () {
    useLocaleRequired('/locales');
    assume(fetchStub).called();

    await pause(20);
    assume(mockContext.dispatch).calledWith(
      { type: 'loaded', payload: { locale: 'en', messages: { example: 'Example' }, file: '/locales/en.json' } }
    );
  });

  it('dispatches ERROR action on bad response', async function () {
    const consoleStub = sinon.stub(console, 'error');
    fetchStub.resolves({ ok: false, status: 404 });
    useLocaleRequired('/locales');
    assume(fetchStub).called();

    await pause(20);
    assume(mockContext.dispatch).calledWith(
      { type: 'error', payload: { file: '/locales/en.json' } }
    );
    assume(consoleStub).calledWith('Error loading locale file (404): /locales/en.json');
  });

  it('dispatches ERROR action on rejected fetch', async function () {
    const consoleStub = sinon.stub(console, 'error');
    fetchStub.rejects(new Error('Bad things man!'));
    useLocaleRequired('/locales');
    assume(fetchStub).called();

    await pause(20);
    assume(mockContext.dispatch).calledWith(
      { type: 'error', payload: { file: '/locales/en.json' } }
    );
    assume(consoleStub).calledWith('Bad things man!');
  });

  describe('SSR', function () {

    beforeEach(function () {
      mockConfig.isBrowser = false;
      useLocaleRequired = getModule().default;
    });

    it('returns LOADING if no locale file', function () {
      const results = useLocaleRequired('/locales');
      assume(results).equals(LOADING);
    });

    it('returns status if set', function () {
      mockContext.status['/locales/en.json'] = LOADED;
      assume(useLocaleRequired('/locales')).equals(LOADED);
    });

    it('does not fetch', function () {
      useLocaleRequired('/locales');
      assume(fetchStub).not.called();
    });
  });
});
