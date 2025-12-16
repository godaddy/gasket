import React from 'react';
import gasket from '@/gasket';
import { withGasketData } from '@gasket/nextjs/layout';

/**
 * Root layout component
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Root layout
 */
function RootLayout({ children }: { children: React.ReactNode; }): React.ReactElement {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}

export default withGasketData(gasket)(RootLayout);
