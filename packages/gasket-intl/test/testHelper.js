import { IntlProvider } from 'react-intl';

export const intl = new IntlProvider({ locale: 'en' }, {}).getChildContext().intl;
