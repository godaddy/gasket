import React from 'react';
import PropTypes from 'prop-types';
{{#if hasGasketRedux}}
import { StoreProvider } from './StoreProvider';
{{/if}}

export default function RootLayout({ children }) {
  return (
    {{#if hasGasketRedux}}
    <StoreProvider>
    {{/if}}
    <html lang='en'>
      <body>{children}</body>
    </html>
    {{#if hasGasketRedux}}
    </StoreProvider>
    {{/if}}
  );
}

RootLayout.propTypes = {
  children: PropTypes.node
};
