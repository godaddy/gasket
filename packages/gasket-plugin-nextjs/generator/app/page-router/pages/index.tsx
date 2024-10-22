/* eslint-disable no-unused-vars */
import React, { CSSProperties } from 'react';
{{#if hasGasketIntl}}
import { FormattedMessage } from 'react-intl';
{{/if}}
import Head from '../components/head.tsx';
import GasketEmblem from '@gasket/assets/react/gasket-emblem.js';

const pageStyle: CSSProperties = { textAlign: 'center' };
const logoStyle: CSSProperties = { width: '250px', height: '250px' };

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
      <p>To get started, edit <code>pages/index.tsx</code> and save to reload.</p>
      <p><a href='https://gasket.dev'>Learn Gasket</a></p>
{{/if}}
    </div>
  )
}

export default IndexPage;
