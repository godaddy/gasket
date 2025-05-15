/* eslint-disable no-unused-vars */
import React from 'react';
{{#if hasGasketIntl}}
import { FormattedMessage } from '{{reactIntlPkg}}';
{{/if}}
import Head from '../components/head.jsx';
import GasketEmblem from '@gasket/assets/react/gasket-emblem.js';

const pageStyle = { textAlign: 'center' };
const logoStyle = { width: '250px', height: '250px' };

function IndexPage() {
  return (
    <div style={pageStyle}>
      <Head title='{{{appName}}}' description='{{{appDescription}}}'/>
      <GasketEmblem style={logoStyle}/>
{{#if hasGasketIntl}}
      <h1><FormattedMessage id='gasket_welcome' /></h1>
      <p><FormattedMessage id='gasket_learn' /></p>
      <p><a href='https://gasket.dev'><FormattedMessage id='gasket_edit_page' /></a></p>
{{else}}
      <h1>Welcome to Gasket!</h1>
      <p>To get started, edit <code>pages/index.js</code> and save to reload.</p>
      <p><a href='https://gasket.dev'>Learn Gasket</a></p>
{{/if}}
    </div>
  )
}

export default IndexPage;
