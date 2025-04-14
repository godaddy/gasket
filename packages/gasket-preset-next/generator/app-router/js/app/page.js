/* eslint-disable no-unused-vars */
import React from 'react';
import GasketEmblem from '@gasket/assets/react/gasket-emblem.js';

export const metadata = {
  title: 'app-router',
  description: 'Gasket App',
  charset: 'UTF-8'
};

const pageStyle = { textAlign: 'center' };
const logoStyle = { width: '250px', height: '250px' };

function IndexPage() {
  return (
    <div style={ pageStyle }>
      <GasketEmblem style={ logoStyle } />
      <h1>Welcome to Gasket!</h1>
      <p>To get started, edit <code>app/page.js</code> and save to reload.</p>
      <p><a href='https://gasket.dev'>Learn Gasket</a></p>
    </div>
  );
}

export default IndexPage;
