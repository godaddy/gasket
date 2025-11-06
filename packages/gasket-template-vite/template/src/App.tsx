import React, { CSSProperties } from 'react';
import GasketEmblem from '@gasket/assets/react/gasket-emblem.js';

const pageStyle: CSSProperties = { textAlign: 'center' };
const logoStyle: CSSProperties = { width: '250px', height: '250px' };

function App() {
  return (
    <div style={pageStyle}>
      <GasketEmblem style={logoStyle}/>
      <h1>Welcome to Gasket!</h1>
      <p>Get started by editing <code>src/App.tsx</code></p>
      <p><a href='https://gasket.dev' target='_blank' rel='noopener noreferrer'>Learn Gasket</a></p>
    </div>
  );
}

export default App;