import React from 'react';
import PropTypes from 'prop-types';
import { manifest } from './config';
import { LocaleStatus } from './utils';
import useLocaleRequired from './use-locale-required';

/**
 * Component that loads a locale file before rendering children
 *
 * @param {object} props - Props
 * @param {LocalePathPart} props.localesPath - Path containing locale files
 * @param {React.Component} [props.loading] - Custom component to show while loading
 * @returns {JSX.Element|null} element
 */
export default function LocaleRequired(props) {
  const { localesPathPart = props.localesPath, loading = null, children } = props;
  const loadState = useLocaleRequired(localesPathPart);
  if (loadState === LocaleStatus.LOADING) return loading;
  return <>{ children }</>;
}

LocaleRequired.propTypes = {
  /** @deprecated use localesPathPart */
  localesPath: PropTypes.string,

  localesPathPart: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.function
  ]),
  loading: PropTypes.node,
  children: PropTypes.node.isRequired
};

LocaleRequired.defaultProps = {
  localesPathPart: manifest.defaultPath
};
