/* eslint-disable no-unused-vars */
import React from 'react';
import GasketEmblem from '@gasket/assets/react/gasket-emblem';

const pageStyle = { textAlign: 'center' };
const logoStyle = { width: '250px', height: '250px' };

export const metadata = {
  title: 'Home',
  description: 'A basic gasket app',
  charset: 'UTF-8'
};

export default function Page() {
  return (
    <div style={ pageStyle }>
      <GasketEmblem style={ logoStyle }/>
      <h1>Welcome to Gasket!</h1>
      <p>To get started, edit <code>pages/index.js</code> and save to reload.</p>
      <p><a href='https://gasket.dev'>Learn Gasket</a></p>
    </div>
  );
}
