import React, { createElement } from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { manifest } from './config';
import { localeUtils, LocaleStatus } from './utils';
import useLocaleRequired from './use-locale-required';

const { defaultLocale, defaultPath } = manifest;

/**
 * Sets up and attaches the getInitialProps static method which preloads locale
 * files during SSR for Next.js pages. For browser routing, the locale files
 * will be fetched as normal.
 * @type {import('./index').attachGetInitialProps}
 */
function attachGetInitialProps(Wrapper, localePathPart) {
  const { WrappedComponent } = Wrapper;

  /** @type {import('./index').attachedGetInitialProps} */
  // @ts-ignore - attaches getInitialProps to Wrapper
  Wrapper.getInitialProps = async (ctx) => {
    const { res } = ctx;
    let localesProps;

    let resolvedLocalePathPart;
    if (typeof localePathPart === 'function') {
      // While this can be resolved by serverLoadData, we will do it here and
      // return in it in props to avoid having to re-resolve during hydrate
      // under different context
      // @ts-ignore - temporary until we fix types in @gasket/helper-intl
      resolvedLocalePathPart = localeUtils.resolveLocalePathPart(
        localePathPart,
        ctx
      );
    }

    if (res && res.locals && res.locals.gasketData) {
      const { locale = defaultLocale } = res.locals.gasketData.intl || {};
      const localesParentDir = require('path').dirname(res.locals.localesDir);
      // @ts-ignore - temporary until we fix types in @gasket/helper-intl
      localesProps = localeUtils.serverLoadData(
        resolvedLocalePathPart ?? localePathPart,
        locale,
        localesParentDir
      );
    }

    return {
      ...(resolvedLocalePathPart
        ? { localePathPart: resolvedLocalePathPart }
        : {}),
      ...(localesProps ? { localesProps } : {}),
      ...(WrappedComponent.getInitialProps
        ? await WrappedComponent.getInitialProps(ctx)
        : {})
    };
  };
}

/**
 * Make an HOC that loads a locale file before rendering wrapped component
 * @type {import('./index').withLocaleRequired}
 */
export default function withLocaleRequired(
  localePathPart = defaultPath,
  options = {}
) {
  const { loading = null, initialProps = false, forwardRef = false } = options;
  // eslint-disable-next-line max-statements
  return (Component) => {
    const displayName = Component.displayName || Component.name || 'Component';

    /**
     * @type {import('./index').LocaleRequiredWrapper}
     */
    function Wrapper(props) {
      const {
        forwardedRef,
        localePathPart: resolvedLocalePathPart,
        ...rest
      } = props;
      const loadState = useLocaleRequired(
        resolvedLocalePathPart ?? localePathPart
      );

      if (loadState === LocaleStatus.LOADING) return loading;

      // @ts-ignore
      return createElement(Component, {
        ...rest,
        ref: forwardedRef
      });
    }

    Wrapper.propTypes = {
      forwardedRef: PropTypes.bool,
      localePathPart: PropTypes.oneOfType([PropTypes.string, PropTypes.func])
    };

    hoistNonReactStatics(Wrapper, Component);
    Wrapper.displayName = `withLocaleRequired(${displayName})`;
    Wrapper.WrappedComponent = Component;

    // Forward ref through the HOC
    if (!forwardRef) {
      if (initialProps || 'getInitialProps' in Component) {
        attachGetInitialProps(Wrapper, localePathPart);
      }

      return Wrapper;
    }

    const Result = React.forwardRef((props, ref) =>
      // @ts-ignore
      createElement(Wrapper, { ...props, forwardedRef: ref })
    );
    hoistNonReactStatics(Result, Component);
    Result.displayName = `ForwardRef(withLocaleRequired/${displayName}))`;
    // @ts-ignore
    Result.WrappedComponent = Component;

    if (initialProps || 'getInitialProps' in Component) {
      attachGetInitialProps(Result, localePathPart);
    }

    return Result;
  };
}
