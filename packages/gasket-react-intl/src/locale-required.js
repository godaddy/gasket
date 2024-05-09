import PropTypes from 'prop-types';
import { manifest } from './config';
import { LocaleStatus } from './utils';
import useLocaleRequired from './use-locale-required';

/**
 * Component that loads a locale file before rendering children
 * @type {import('./index').LocaleRequired}
 */
export default function LocaleRequired(props) {
  const { localesPath, loading = null, children } = props;
  const loadState = useLocaleRequired(localesPath);

  if (loadState === LocaleStatus.LOADING) return loading;

  return children;
}

LocaleRequired.propTypes = {
  localesPath: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  loading: PropTypes.node,
  children: PropTypes.node.isRequired
};

LocaleRequired.defaultProps = {
  localesPathPart: manifest.defaultPath
};
