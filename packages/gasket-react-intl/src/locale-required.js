import React from 'react';
import PropTypes from 'prop-types';
import { manifest } from './config';
import { LOADING } from './utils';
import { useGasketIntl } from './hooks';

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
  const loadState = useGasketIntl(localesPath);
  if (loadState === LOADING) return loading;
  return <>{ children }</>;
}

LocaleRequired.propTypes = {
  localesPath: PropTypes.string,
  loading: PropTypes.node,
  children: PropTypes.node.isRequired
};

LocaleRequired.defaultProps = {
  localesPath: manifest.defaultPath
};
