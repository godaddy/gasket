import React from 'react';
{{#if nextDevProxy}}
import gasket from '@/gasket';
{{else}}
import gasket from '../gasket';
{{/if}}
import { withGasketData } from '@gasket/nextjs/layout';

function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}

export default withGasketData(gasket)(RootLayout);
