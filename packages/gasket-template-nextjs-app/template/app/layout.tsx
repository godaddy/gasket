import React from 'react';
import gasket from '@/gasket';
import { withGasketData } from '@gasket/nextjs/layout';

function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}

export default withGasketData(gasket)(RootLayout);
