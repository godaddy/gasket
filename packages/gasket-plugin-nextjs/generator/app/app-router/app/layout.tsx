import React from 'react';
{{#if (eq nextServerType 'customServer')}}
import gasket from '@/gasket'; // tsconfig path alias
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
