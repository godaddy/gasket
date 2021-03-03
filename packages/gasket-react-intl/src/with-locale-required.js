import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import path from 'path';
import { manifest } from './config';
import { localeUtils, LocaleStatus } from './utils';
import useLocaleRequired from './use-locale-required';

const { defaultLocale, defaultPath } = manifest;

/**
 * Sets up and attaches the getInitialProps static method which preloads locale
 * files during SSR for Next.js pages. For browser routing, the locale files
 * will be fetched as normal.
 *
 * @param {React.ComponentType} Wrapper - The HOC
 * @param {LocalePathPart} localePathPart - Path containing locale files
 */
function attachGetInitialProps(Wrapper, localePathPart) {
  const { WrappedComponent } = Wrapper;

  Wrapper.getInitialProps = async (ctx) => {
    const { res } = ctx;
    let localesProps;

    if (res) {
      const { locale = defaultLocale } = res.locals.gasketData.intl || {};
      const localesParentDir = path.dirname(res.locals.localesDir);
      localesProps = localeUtils.serverLoadData(localePathPart, locale, localesParentDir);
    }

    return {
      ...(localesProps ? { localesProps } : {}),
      ...(WrappedComponent.getInitialProps ? await WrappedComponent.getInitialProps(ctx) : {})
    };
  };
}

/**
 * Make an HOC that loads a locale file before rendering wrapped component
 *
 * @param {LocalePathPart} localePathPart - Path containing locale files
 * @param {object} [options] - Options
 * @param {React.Component} [options.loading=null] - Custom component to show while loading
 * @param {React.Component} [options.initialProps=false] - Preload locales during SSR with Next.js pages
 * @param {React.Component} [options.forwardRef=false] - Forward refs
 * @returns {function} wrapper
 */
export default function withLocaleRequired(localePathPart = defaultPath, options = {}) {
  const { loading = null, initialProps = false, forwardRef = false } = options;
  /**
   * Wrap the component
   * @param {React.Component} Component - Component to wrap
   * @returns {React.Component} wrapped component
   */
  return Component => {
    const displayName = Component.displayName || Component.name || 'Component';

    /**
     * Wrapper component that returns based on locale file status
     *
     * @param {object} props - Component props
     * @param {object} [props.forwardedRef] - Forwarded ref
     * @returns {JSX.Element} element
     */
    function Wrapper(props) {
      // eslint-disable-next-line react/prop-types
      const { forwardedRef, ...rest } = props;
      const loadState = useLocaleRequired(localePathPart);
      if (loadState === LocaleStatus.LOADING) return loading;
      return <Component { ...rest } ref={ forwardedRef }/>;
    }

    hoistNonReactStatics(Wrapper, Component);
    Wrapper.displayName = `withLocaleRequired(${ displayName })`;
    Wrapper.WrappedComponent = Component;

    let Result = Wrapper;

    // Forward ref through the HOC
    if (forwardRef) {
      Result = React.forwardRef((props, ref) => <Wrapper { ...props } forwardedRef={ ref }/>);
      hoistNonReactStatics(Result, Component);
      Result.displayName = `ForwardRef(withLocaleRequired/${ displayName }))`;
      Result.WrappedComponent = Component;
    }

    if (initialProps || 'getInitialProps' in Component) {
      attachGetInitialProps(Result, localePathPart);
    }

    return Result;
  };
}
