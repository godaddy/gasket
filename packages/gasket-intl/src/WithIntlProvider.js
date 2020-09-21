import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import hoistNonReactStatics from 'hoist-non-react-statics';
import localeApi, { selectAllMessages } from './LocaleApi';
import { connect } from 'react-redux';
import { resourceShape } from 'reduxful/react-addons';
import { selectLocale } from './LocaleApi';

const withIntlProvider = () => {
  return Component => {
    let Wrapper = class extends React.Component {

      componentDidMount() {
        const { _locale, _getSettings } = this.props;
        if (!_locale) {
          _getSettings();
        }
      }

      render() {
        /* eslint-disable-next-line no-unused-vars */
        const { _locale, _messages, ...ownProps } = this.props;

        if (!_locale) return null;

        return (
          <IntlProvider locale={ _locale } key={ _locale } messages={ _messages } initialNow={ Date.now() }>
            <Component { ...ownProps } />
          </IntlProvider>
        );
      }
    };

    Wrapper.propTypes = {
      _locale: PropTypes.string,
      _settings: resourceShape,
      _getSettings: PropTypes.func,
      _messages: PropTypes.object
    };

    function mapStateToProps(state, ownProps) {
      return {
        _locale: selectLocale(state, ownProps.navigatorFallback),
        _messages: selectAllMessages(state)
      };
    }

    const mapDispatchToProps = {
      _getSettings: localeApi.actionCreators.getSettings
    };

    Wrapper = connect(mapStateToProps, mapDispatchToProps)(Wrapper);

    hoistNonReactStatics(Wrapper, Component);
    Wrapper.displayName = `withIntlProvider(${Component.displayName || Component.name || 'Component'})`;
    Wrapper.WrappedComponent = Component;

    Wrapper.defaultProps = {
      navigatorFallback: false
    };

    return Wrapper;
  };
};

export default withIntlProvider;
