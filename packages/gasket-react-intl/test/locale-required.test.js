import React from 'react';
import { render } from '@testing-library/react';
import mockManifest from './fixtures/mock-manifest.json';
import { LocaleStatus } from '../src/utils';
import LocaleRequired from '../src/locale-required';
import useLocaleRequired from '../src/use-locale-required';

jest.mock('../src/use-locale-required');

const { ERROR, LOADED, LOADING } = LocaleStatus;

describe('LocaleRequired', function () {
  let mockConfig, wrapper;

  const doMount = props => <LocaleRequired { ...props }>MockComponent</LocaleRequired>;

  beforeEach(function () {
    mockConfig = {
      defaultLocale: 'en-US',
      manifest: { ...mockManifest, paths: { ...mockManifest.paths } },
      isBrowser: false
    };
    useLocaleRequired.mockClear();
  });

  describe('#render', function () {
    it('renders null if loading', function () {
      useLocaleRequired.mockReturnValue(LOADING);
      wrapper = render(doMount({}));
      expect(wrapper.baseElement.textContent).toEqual('');
    });

    it('renders custom loader if loading', function () {
      useLocaleRequired.mockReturnValue(LOADING);
      wrapper = render(doMount({ loading: 'loading...' }));
      expect(wrapper.baseElement.textContent).toEqual('loading...');
    });

    it('renders wrapped component if LOADED', function () {
      useLocaleRequired.mockReturnValue(LOADED);
      wrapper = render(doMount({ loading: 'loading...' }));
      expect(wrapper.baseElement.textContent).toContain('MockComponent');
    });

    it('renders wrapped component if ERROR', function () {
      useLocaleRequired.mockReturnValue(ERROR);
      wrapper = render(doMount({ loading: 'loading...' }));
      expect(wrapper.baseElement.textContent).toContain('MockComponent');
    });

    it('supports localesPath', function () {
      useLocaleRequired.mockReturnValue(LOADING);
      wrapper = render(doMount({ localesPath: '/bogus' }));
      expect(useLocaleRequired).toHaveBeenCalledWith('/bogus');
      expect(wrapper.baseElement.textContent).toEqual('');
    });

    it('supports localesPath as thunk', function () {
      const mockThunk = jest.fn();
      useLocaleRequired.mockReturnValue(LOADING);
      wrapper = render(doMount({ localesPath: mockThunk }));
      expect(useLocaleRequired).toHaveBeenCalledWith(mockThunk);
      expect(wrapper.baseElement.textContent).toEqual('');
    });
  });
});
