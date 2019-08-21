import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import hoistNonReactStatics from 'hoist-non-react-statics';
import localeApi, { selectAllMessages } from './LocaleApi';
import { loadLocaleMapIntoStore } from './ServerUtils';
import { connect } from 'react-redux';
import { isLoaded } from 'reduxful';
import { resourceShape } from 'reduxful/react-addons';
import { selectLanguage } from './Utils';

const withIntlProvider = () => {
  return Component => {
    let Wrapper = class extends React.Component {

      componentDidMount() {
        const { _manifest, _getLocaleManifest } = this.props;
        if (!isLoaded(_manifest)) {
          _getLocaleManifest();
        }
      }

      render() {
        /* eslint-disable-next-line no-unused-vars */
        const { _language, _messages, _manifest, _getLocaleManifest, ...ownProps } = this.props;
        if (!isLoaded(_manifest)) {
          return null;
        }

        return (
          <IntlProvider locale={ _language } messages={ _messages } initialNow={ Date.now() }>
            <Component { ...ownProps } />
          </IntlProvider>
        );
      }
    };

    Wrapper.propTypes = {
      _language: PropTypes.string,
      _manifest: resourceShape,
      _getLocaleManifest: PropTypes.func,
      _messages: PropTypes.object
    };

    function mapStateToProps(state) {
      return {
        _language: selectLanguage(state),
        _manifest: localeApi.selectors.getLocaleManifest(state, {}),
        _messages: selectAllMessages(state)
      };
    }

    const mapDispatchToProps = {
      _getLocaleManifest: localeApi.actionCreators.getLocaleManifest
    };

    Wrapper = connect(mapStateToProps, mapDispatchToProps)(Wrapper);

    hoistNonReactStatics(Wrapper, Component);
    Wrapper.displayName = `withIntlProvider(${Component.displayName || Component.name || 'Component'})`;

    Wrapper.getInitialProps = async (appCtx) => {
      const { ctx: { isServer, store, req } } = appCtx;
      if (isServer) {
        const { localesDir } = req;
        if (localesDir) {
          await loadLocaleMapIntoStore(store, localesDir);
        } else {
          // eslint-disable-next-line no-console
          console.error(`withIntlProvider: localesDir undefined for ${req.originalUrl}`);
        }
      }

      return {
        ...(Component.getInitialProps ? await Component.getInitialProps(appCtx) : {})
      };
    };

    Wrapper.WrappedComponent = Component;
    return Wrapper;
  };
};

export default withIntlProvider;
