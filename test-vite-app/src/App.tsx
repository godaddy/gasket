import React, { CSSProperties, useEffect, useState } from 'react';
import GasketEmblem from '@gasket/assets/react/gasket-emblem.js';

const pageStyle: CSSProperties = { textAlign: 'center' };
const logoStyle: CSSProperties = { width: '250px', height: '250px' };

function App() {
  const [visitorInfo, setVisitorInfo] = useState<any>(null);

  useEffect(() => {
    // Fetch visitor information from API
    fetch('/api/visitor')
      .then(res => res.json())
      .then(data => {
        console.log('🔍 Visitor Information:', data);
        setVisitorInfo(data);
      })
      .catch(err => {
        console.error('❌ Failed to fetch visitor info:', err);
      });
  }, []);

  return (
    <div style={pageStyle}>
      <GasketEmblem style={logoStyle}/>
      <h1>Welcome to Gasket!</h1>
      <p>Get started by editing <code>src/App.tsx</code></p>
      
      {visitorInfo && (
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: '#f0f9ff',
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '30px auto',
          textAlign: 'left'
        }}>
          <h3 style={{ marginTop: 0 }}>👤 Visitor Info</h3>
          <pre style={{ 
            background: '#fff', 
            padding: '15px', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(visitorInfo, null, 2)}
          </pre>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: 0 }}>
            ℹ️ Check your browser console for the full log
          </p>
        </div>
      )}
      
      <p><a href='https://gasket.dev' target='_blank' rel='noopener noreferrer'>Learn Gasket</a></p>
    </div>
  );
}

export default App;
