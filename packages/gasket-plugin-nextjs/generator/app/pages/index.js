/* eslint-disable no-unused-vars */
import React from 'react';
import Head from '../components/head';
import GasketEmblem from '@gasket/assets/react/gasket-emblem';

const pageStyle = { textAlign: 'center' };
const logoStyle = { width: '250px', height: '250px' };

export const IndexPage = () => (
  <div style={ pageStyle }>
    <Head title='Home'/>
    <GasketEmblem style={ logoStyle }/>
    <h1>Welcome to Gasket!</h1>
    <p>To get started, edit <code>pages/index.js</code> and save to reload.</p>
    <p><a href='https://gasket.dev'>Learn Gasket</a></p>
  </div>
);

export default IndexPage;
