/* eslint-disable no-unused-vars */
import React from 'react';
import Head from '../components/head';
import GasketLogo from '@gasket/assets/react/gasket-logo';

const pageStyle = { textAlign: 'center' };
const logoStyle = { width: '250px' };

export const IndexPage = () => (
  <div style={ pageStyle }>
    <Head title='Home'/>
    <GasketLogo style={ logoStyle }/>
    <h1>Welcome to Gasket!</h1>
    <p>To get started, edit <code>pages/index.js</code> and save to reload.</p>
    <p><a href='https://learn.gasket.int.godaddy.com'>Learn Gasket</a></p>
  </div>
);

export default IndexPage;
