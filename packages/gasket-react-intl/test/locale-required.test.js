import React from 'react';
import assume from 'assume';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { mount } from 'enzyme';
import { ERROR, LOADED, LOADING } from '../src/utils';
import mockManifest from './fixtures/mock-manifest.json';

describe('LocaleRequired', function () {
  let mockConfig, useGasketIntlStub, LocaleRequired, wrapper;

  const doMount = props => mount(<LocaleRequired { ...props }>MockComponent</LocaleRequired>);

  beforeEach(function () {
    useGasketIntlStub = sinon.stub();
    mockConfig = {
      defaultLocale: 'en-US',
      manifest: { ...mockManifest, paths: { ...mockManifest.paths } },
      isBrowser: false
    };
    LocaleRequired = proxyquire('../src/locale-required', {
      './config': mockConfig,
      './hooks': {
        useGasketIntl: useGasketIntlStub
      }
    }).default;
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('#render', function () {
    it('renders null if loading', function () {
      useGasketIntlStub.returns(LOADING);
      wrapper = doMount({});
      assume(wrapper.html()).eqls(null);
    });

    it('renders custom loader if loading', function () {
      useGasketIntlStub.returns(LOADING);
      wrapper = doMount({ loading: 'loading...' });
      assume(wrapper.html()).eqls('loading...');
    });

    it('renders wrapped component if LOADED', function () {
      useGasketIntlStub.returns(LOADED);
      wrapper = doMount({ loading: 'loading...' });
      assume(wrapper.html()).includes('MockComponent');
    });

    it('renders wrapped component if ERROR', function () {
      useGasketIntlStub.returns(ERROR);
      wrapper = doMount({ loading: 'loading...' });
      assume(wrapper.html()).includes('MockComponent');
    });
  });
});
