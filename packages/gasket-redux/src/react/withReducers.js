import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

/**
 * HOC for dynamically attaching reducers when components mount.
 * This is useful for shared components requiring no pre-setup for a consuming app.
 * Also useful for code-splitting, allowing reducers to only be loaded when needed.
 *
 * @param {Object.<string,function>} reducers - Reducers to attach
 * @returns {Function} Wrapper
 */
export default function withReducers(reducers) {

  return Component => {

    class Wrapper extends React.Component {

      componentDidMount() {
        const { isAttached } = this.props;
        const { store } = this.context;
        //
        // If attached during client getInitialProps, avoid repeat attachment
        //
        if (!isAttached) store.attachReducers(reducers);
      }

      render() {
        // eslint-disable-next-line no-unused-vars
        const { isAttached, ...props } = this.props;
        return <Component { ...props } />;
      }
    }

    hoistNonReactStatics(Wrapper, Component);

    Wrapper.getInitialProps = async (ctx) => {
      const { store, isServer } = ctx;
      store.attachReducers(reducers);
      return {
        //
        // If attached during server getInitialProps, we will still need to attach in browser
        //
        isAttached: !isServer,
        ...(Component.getInitialProps ? await Component.getInitialProps(ctx) : {})
      };
    };

    Wrapper.propTypes = {
      isAttached: PropTypes.bool
    };

    Wrapper.contextTypes = {
      store: PropTypes.object.isRequired
    };

    Wrapper.displayName = `withReducers(${Component.displayName || Component.name || 'Component'})`;
    Wrapper.WrappedComponent = Component;
    return Wrapper;
  };
}
