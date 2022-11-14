import React from 'react';
import assume from 'assume';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { render } from '@testing-library/react';
import mockManifest from './fixtures/mock-manifest.json';
import { LocaleStatus } from '../src/utils';
const { ERROR, LOADED, LOADING } = LocaleStatus;

describe('LocaleRequired', function () {
  let mockConfig, useLocaleRequiredStub, LocaleRequired, wrapper;

  const doMount = props => <LocaleRequired { ...props }>MockComponent</LocaleRequired>;

  beforeEach(function () {
    useLocaleRequiredStub = sinon.stub();
    mockConfig = {
      defaultLocale: 'en-US',
      manifest: { ...mockManifest, paths: { ...mockManifest.paths } },
      isBrowser: false
    };
    LocaleRequired = proxyquire('../src/locale-required', {
      './config': mockConfig,
      './use-locale-required': {
        default: useLocaleRequiredStub
      }
    }).default;
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('#render', function () {
    it('renders null if loading', function () {
      useLocaleRequiredStub.returns(LOADING);
      wrapper = render(doMount({}));
      assume(wrapper.baseElement.textContent).eqls('');
    });

    it('renders custom loader if loading', function () {
      useLocaleRequiredStub.returns(LOADING);
      wrapper = render(doMount({ loading: 'loading...' }));
      assume(wrapper.baseElement.textContent).eqls('loading...');
    });

    it('renders wrapped component if LOADED', function () {
      useLocaleRequiredStub.returns(LOADED);
      wrapper = render(doMount({ loading: 'loading...' }));
      assume(wrapper.baseElement.textContent).includes('MockComponent');
    });

    it('renders wrapped component if ERROR', function () {
      useLocaleRequiredStub.returns(ERROR);
      wrapper = render(doMount({ loading: 'loading...' }));
      assume(wrapper.baseElement.textContent).includes('MockComponent');
    });

    it('supports localesPath', function () {
      useLocaleRequiredStub.returns(LOADING);
      wrapper = render(doMount({ localesPath: '/bogus' }));
      assume(useLocaleRequiredStub).calledWith('/bogus');
      assume(wrapper.baseElement.textContent).eqls('');
    });

    it('supports localesPath as thunk', function () {
      const mockThunk = sinon.stub();
      useLocaleRequiredStub.returns(LOADING);
      wrapper = render(doMount({ localesPath: mockThunk }));
      assume(useLocaleRequiredStub).calledWith(mockThunk);
      assume(wrapper.baseElement.textContent).eqls('');
    });
  });
});
