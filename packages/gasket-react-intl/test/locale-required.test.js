import React from 'react';
import assume from 'assume';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { mount } from 'enzyme';
import mockManifest from './fixtures/mock-manifest.json';
import { LocaleStatus } from '../src/utils';
const { ERROR, LOADED, LOADING } = LocaleStatus;

describe('LocaleRequired', function () {
  let mockConfig, useLocaleRequiredStub, LocaleRequired, wrapper;

  const doMount = props => mount(<LocaleRequired { ...props }>MockComponent</LocaleRequired>);

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
      wrapper = doMount({});
      assume(wrapper.html()).eqls(null);
    });

    it('renders custom loader if loading', function () {
      useLocaleRequiredStub.returns(LOADING);
      wrapper = doMount({ loading: 'loading...' });
      assume(wrapper.html()).eqls('loading...');
    });

    it('renders wrapped component if LOADED', function () {
      useLocaleRequiredStub.returns(LOADED);
      wrapper = doMount({ loading: 'loading...' });
      assume(wrapper.html()).includes('MockComponent');
    });

    it('renders wrapped component if ERROR', function () {
      useLocaleRequiredStub.returns(ERROR);
      wrapper = doMount({ loading: 'loading...' });
      assume(wrapper.html()).includes('MockComponent');
    });

    it('supports localesPath', function () {
      useLocaleRequiredStub.returns(LOADING);
      wrapper = doMount({ localesPath: '/bogus' });
      assume(useLocaleRequiredStub).calledWith('/bogus');
      assume(wrapper.html()).eqls(null);
    });

    it('supports localesPath as thunk', function () {
      const mockThunk = sinon.stub();
      useLocaleRequiredStub.returns(LOADING);
      wrapper = doMount({ localesPath: mockThunk });
      assume(useLocaleRequiredStub).calledWith(mockThunk);
      assume(wrapper.html()).eqls(null);
    });
  });
});
