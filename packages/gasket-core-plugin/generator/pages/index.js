import React from 'react';
import Head from '../components/head';
import GasketLogo from '@gasket/assets/react/gasket-logo';

export const IndexPage = () => (
  <div style={{ textAlign: 'center' }}>
    <Head title='Home'/>
    <GasketLogo style={{ width: '250px' }}/>
    <h1>Welcome to Gasket!</h1>
    <p>To get started, edit <code>pages/index.js</code> and save to reload.</p>
    <p><a href='https://learn.gasket.int.godaddy.com'>Learn Gasket</a></p>
  </div>
);

export default IndexPage;
