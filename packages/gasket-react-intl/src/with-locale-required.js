import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { manifest } from './config';
import { LOADING } from './utils';
import { useGasketIntl } from './hooks';

/**
 * Make an HOC that loads a locale file before rendering wrapped component
 *
 * @param {LocalePathPart} localesPath - Path containing locale files
 * @param {object} [options] - Options
 * @param {React.Component} [options.loading] - Custom component to show while loading
 * @returns {function} wrapper
 */
export default function withLocaleRequired(localesPath = manifest.localesPath, options = {}) {
  const { loading = null } = options;
  /**
   * Wrap the component
   * @param {React.Component} Component - Component to wrap
   * @returns {React.Component} wrapped component
   */
  return Component => {
    /**
     * Wrapper component that returns based on locale file status
     *
     * @param {object} props - Component props
     * @returns {JSX.Element} element
     */
    function Wrapper(props) {
      const loadState = useGasketIntl(localesPath);
      if (loadState === LOADING) return loading;
      return <Component { ...props } />;
    }

    Wrapper.displayName = `withLocaleRequired(${ Component.displayName || Component.name || 'Component' })`;
    hoistNonReactStatics(Wrapper, Component);
    return Wrapper;
  };
}
