/* eslint-disable no-unused-vars */
import React, { CSSProperties } from 'react';
import GasketEmblem from '@gasket/assets/react/gasket-emblem.js';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '{{{appName}}}',
  description: '{{{appDescription}}}'
};

const pageStyle: CSSProperties = { textAlign: 'center' };
const logoStyle: CSSProperties = { width: '250px', height: '250px' };

export const IndexPage = () => (
  <div style={pageStyle}>
    <GasketEmblem style={logoStyle} />
    <h1>Welcome to Gasket!</h1>
    <p>To get started, edit <code>pages/index.js</code> and save to reload.</p>
    <p><a href='https://gasket.dev'>Learn Gasket</a></p>
  </div>
);

export default IndexPage;
