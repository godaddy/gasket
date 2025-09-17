import React, { CSSProperties } from 'react';
import { FormattedMessage } from 'react-intl';
import Head from '../components/head.tsx';
import GasketEmblem from '@gasket/assets/react/gasket-emblem.js';

const pageStyle: CSSProperties = { textAlign: 'center' };
const logoStyle: CSSProperties = { width: '250px', height: '250px' };

function IndexPage() {
  return (
    <div style={ pageStyle }>
      <Head title='{{{appName}}}' description='Gasket App'/>
      <GasketEmblem style={ logoStyle }/>
      <h1><FormattedMessage id='gasket_welcome' /></h1>
      <p><FormattedMessage id='gasket_learn' /></p>
      <p><a href='https://gasket.dev'><FormattedMessage id='gasket_edit_page' /></a></p>
    </div>
  );
}

export default IndexPage;
