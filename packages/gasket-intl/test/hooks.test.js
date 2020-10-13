import React from 'react';
import assume from 'assume';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import mockManifest from './fixtures/mock-manifest.json';
import { ERROR, LOADED, LOADING } from '../src/utils';

// helper to wait for async actions
const pause = ms => new Promise((resolve) => setTimeout(resolve, ms));

describe('useGasketIntl', function () {
  let mockConfig, mockContext, fetchStub, useGasketIntl;

  const getModule = () => {
    return proxyquire('../src/hooks', {
      'react': {
        useContext: sinon.stub().returns(mockContext)
      },
      '@gasket/fetch': fetchStub,
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
    useGasketIntl = getModule().useGasketIntl;
  });

  afterEach(function () {
    sinon.restore();
  });

  it('fetches locales url if not loaded', function () {
    const results = useGasketIntl('/locales');
    assume(results).equals(LOADING);
    assume(fetchStub).calledWith('/locales/en.json');
  });

  it('returns LOADING if fetching', function () {
    const results = useGasketIntl('/locales');
    assume(results).equals(LOADING);
    assume(fetchStub).called();
  });

  it('returns status if set', function () {
    mockContext.status['/locales/en.json'] = LOADED;
    assume(useGasketIntl('/locales')).equals(LOADED);

    mockContext.status['/locales/en.json'] = ERROR;
    assume(useGasketIntl('/locales')).equals(ERROR);

    mockContext.status['/locales/en.json'] = LOADING;
    assume(useGasketIntl('/locales')).equals(LOADING);
  });

  it('dispatches LOADED action when loaded', async function () {
    useGasketIntl('/locales');
    assume(fetchStub).called();

    await pause(20);
    assume(mockContext.dispatch).calledWith(
      { type: 'loaded', payload: { locale: 'en', messages: { example: 'Example' }, file: '/locales/en.json' } }
    );
  });

  it('dispatches ERROR action on bad response', async function () {
    const consoleStub = sinon.stub(console, 'error');
    fetchStub.resolves({ ok: false, status: 404 });
    useGasketIntl('/locales');
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
    useGasketIntl('/locales');
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
      useGasketIntl = getModule().useGasketIntl;
    });

    it('returns LOADING if no locale file', function () {
      const results = useGasketIntl('/locales');
      assume(results).equals(LOADING);
    });

    it('returns status if set', function () {
      mockContext.status['/locales/en.json'] = LOADED;
      assume(useGasketIntl('/locales')).equals(LOADED);
    });

    it('does not fetch', function () {
      useGasketIntl('/locales');
      assume(fetchStub).not.called();
    });
  });
});
