import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { isLoaded, getResourceKey } from 'reduxful';
import { resourceShape } from 'reduxful/react-addons';
import localeApi from './LocaleApi';
import { getParamsForIdentifiers } from './Utils';

class LocaleRequiredBase extends React.Component {

  constructor() {
    super(...arguments);

    if (this.props.module) {
      if (process.env.NODE_ENV !== 'production') {   // eslint-disable-line no-process-env
        console.warn('The prop `module` is deprecated. Use `identifier` instead.');  // eslint-disable-line no-console
      }
    }
  }

  componentDidMount() {
    const { _messages, _getMessages, _params } = this.props;

    _params.forEach((params, idx) => {
      if (!isLoaded(_messages[idx])) _getMessages(params);
    });
  }

  isServer() {
    return typeof window === 'undefined';
  }

  /**
   * This function checks if locale data has already been checked or not
   *
   * @returns {boolean} returns true if the keys stored match with the keys available.
   */
  allKeysChecked() {
    if (this.isServer()) {
      return false;
    }
    const msgs = LocaleRequiredBase.checkedMessages;
    return !this.props._params.some(p => {
      const key = getResourceKey('getMessages', p);
      return !(key in msgs);
    });
  }

  /**
   * This function stores all the keys that have been checked, for use with allKeysChecked function later
   */
  setKeysChecked() {
    if (this.isServer()) {
      return;
    }
    this.props._params.every(p => {
      LocaleRequiredBase.checkedMessages[getResourceKey('getMessages', p)] = true;
    });
  }

  /**
   * This function checks if the IntlProvider component has been refreshed with the latest locale data.
   * This is required because redux connect HOC is invoked in a non sequential order, causing a situation
   * where this components may have the latest data set, when IntlProvider is may still be using older data set.
   *
   * @param {resourceShape} msgResource - resource from a locale data request
   * @returns {Boolean} returns true if data is loaded for all the calls.
   */
  isProvided(msgResource) {
    const { intl: { messages: intlMessages } } = this.props;
    return Object.keys(msgResource.value).every(k => k in intlMessages);
  }

  /**
   * This function checks if the requested resources have been loaded.
   *
   * @returns {boolean} returns true if resources have been loaded and also updated in IntlProvider component.
   */
  isLoaded() {
    if (this.allKeysChecked()) {
      return true;
    }
    const { _messages } = this.props;
    const result = _messages.every(m => isLoaded(m) && this.isProvided(m));
    if (!result) {
      return false;
    }
    this.setKeysChecked();
    return true;
  }

  render() {
    const { loading, children } = this.props;

    if (!this.isLoaded()) {
      return loading;
    }
    return (
      <Fragment>
        { children }
      </Fragment>
    );
  }
}

LocaleRequiredBase.checkedMessages = {};

LocaleRequiredBase.propTypes = {
  intl: intlShape,
  module: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  identifier: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.arrayOf(PropTypes.object)
  ]),
  loading: PropTypes.node,
  children: PropTypes.node.isRequired,
  // injected
  _getMessages: PropTypes.func,
  _params: PropTypes.arrayOf(PropTypes.object),
  _messages: PropTypes.arrayOf(resourceShape)
};

LocaleRequiredBase.defaultProps = {
  loading: null
};

function mapStateToProps(state, ownProps) {
  const { module, identifier } = ownProps;
  const _params = getParamsForIdentifiers(state, identifier || module);
  const _messages = _params.map(
    params => localeApi.selectors.getMessages(state, params)
  );
  return {
    _params,
    _messages
  };
}

const mapDispatchToProps = {
  _getMessages: localeApi.actionCreators.getMessages
};

const LocaleRequiredConnectedBase = connect(mapStateToProps, mapDispatchToProps)(LocaleRequiredBase);

const LocaleRequired = injectIntl(LocaleRequiredConnectedBase);

export {
  LocaleRequired as default,
  LocaleRequiredConnectedBase,
  LocaleRequiredBase
};
