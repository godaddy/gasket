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
  const { localesPath, loading = null, children } = props;
  const loadState = useLocaleRequired(localesPath);
  if (loadState === LocaleStatus.LOADING) return loading;
  return <>{ children }</>;
}

LocaleRequired.propTypes = {
  localesPath: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func
  ]),
  loading: PropTypes.node,
  children: PropTypes.node.isRequired
};

LocaleRequired.defaultProps = {
  localesPathPart: manifest.defaultPath
};
