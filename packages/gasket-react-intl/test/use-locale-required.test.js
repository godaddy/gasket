import { useContext } from 'react';
import { LocaleStatus } from '../src/utils';
import useLocaleRequired from '../src/use-locale-required';
import fetch from '@gasket/fetch';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn()
}));

jest.mock('@gasket/fetch', () => jest.fn());

jest.mock('../src/config', () => ({
  isBrowser: true,
  clientData: {},
  manifest: require('./fixtures/mock-manifest.json')
}));

const { ERROR, LOADED, LOADING } = LocaleStatus;

// helper to wait for async actions
const pause = ms => new Promise((resolve) => setTimeout(resolve, ms));

describe('useLocaleRequired', function () {
  let mockConfig, mockContext, dispatchMock;

  beforeEach(function () {
    fetch.mockResolvedValue({ ok: true, json: () => ({ example: 'Example' }) });

    dispatchMock = jest.fn();

    mockContext = {
      locale: 'en',
      status: {},
      dispatch: dispatchMock
    };

    useContext.mockReturnValue(mockContext);

    mockConfig = require('../src/config');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches locales url if not loaded', function () {
    const results = useLocaleRequired('/locales');
    expect(results).toEqual(LOADING);
    expect(fetch).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith('/locales/en.json');
  });

  it('handle thunks for locale paths', function () {
    const mockThunk = jest.fn().mockReturnValue('/custom/locales');

    const results = useLocaleRequired(mockThunk);
    expect(results).toEqual(LOADING);
    expect(fetch).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith('/custom/locales/en.json');
  });

  it('returns LOADING if fetching', function () {
    const results = useLocaleRequired('/locales');
    expect(results).toEqual(LOADING);
    expect(fetch).toHaveBeenCalled();
  });

  it('returns status if set', function () {
    mockContext.status['/locales/en.json'] = LOADED;
    expect(useLocaleRequired('/locales')).toEqual(LOADED);

    mockContext.status['/locales/en.json'] = ERROR;
    expect(useLocaleRequired('/locales')).toEqual(ERROR);

    mockContext.status['/locales/en.json'] = LOADING;
    expect(useLocaleRequired('/locales')).toEqual(LOADING);
  });

  it('dispatches LOADED action when loaded', async function () {
    useLocaleRequired('/locales');
    expect(fetch).toHaveBeenCalled();

    await pause(20);
    expect(dispatchMock).toHaveBeenCalledWith(
      { type: 'loaded', payload: { locale: 'en', messages: { example: 'Example' }, file: '/locales/en.json' } }
    );
  });

  it('dispatches ERROR action on bad response', async function () {
    console.error = jest.fn();
    fetch.mockResolvedValue({ ok: false, status: 404 });
    useLocaleRequired('/locales');
    expect(fetch).toHaveBeenCalled();

    await pause(20);
    expect(dispatchMock).toHaveBeenCalledWith(
      { type: 'error', payload: { file: '/locales/en.json' } }
    );
    expect(console.error).toHaveBeenCalledWith('Error loading locale file (404): /locales/en.json');

  });

  it('dispatches ERROR action on rejected fetch', async function () {
    console.error = jest.fn();
    fetch.mockRejectedValue(new Error('Bad things man!'));
    useLocaleRequired('/locales');
    expect(fetch).toHaveBeenCalled();

    await pause(20);
    expect(dispatchMock).toHaveBeenCalledWith(
      { type: 'error', payload: { file: '/locales/en.json' } }
    );
    expect(console.error).toHaveBeenCalledWith('Bad things man!');
  });

  describe('SSR', function () {

    beforeEach(function () {
      mockConfig.isBrowser = false;
    });

    it('returns LOADING if no locale file', function () {
      const results = useLocaleRequired('/locales');
      expect(results).toEqual(LOADING);
    });

    it('returns status if set', function () {
      mockContext.status['/locales/en.json'] = LOADED;
      expect(useLocaleRequired('/locales')).toEqual(LOADED);
    });

    it('does not fetch', function () {
      useLocaleRequired('/locales');
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
