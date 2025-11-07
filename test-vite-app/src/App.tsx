import { CSSProperties, useEffect, useState } from 'react';
import GasketEmblem from '@gasket/assets/react/gasket-emblem.js';

// Only import web component on client side (not during SSR)
if (typeof window !== 'undefined') {
  import('./components/status-badge');
}

const pageStyle: CSSProperties = { textAlign: 'center' };
const logoStyle: CSSProperties = { width: '250px', height: '250px' };

interface AppProps {
  serverData?: {
    timestamp: string;
    url: string;
    userAgent: string;
  };
}

function App({ serverData }: AppProps) {
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
      <h1>Welcome to Gasket + Vite!</h1>
      <p>This app demonstrates <strong>Server-Side Rendering (SSR)</strong> with Vite</p>
      
      {serverData && (
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: '#f0fdf4',
          border: '2px solid #86efac',
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '30px auto',
          textAlign: 'left'
        }}>
          <h3 style={{ marginTop: 0, color: '#166534' }}>🚀 Server-Side Rendered Data</h3>
          <p style={{ color: '#15803d', margin: '10px 0' }}>
            This data was rendered on the <strong>server</strong> and sent as HTML!
          </p>
          <div style={{ 
            background: '#fff', 
            padding: '15px', 
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'monospace'
          }}>
            <div><strong>Timestamp:</strong> {serverData.timestamp}</div>
            <div><strong>URL:</strong> {serverData.url}</div>
            <div><strong>User-Agent:</strong> {serverData.userAgent.substring(0, 50)}...</div>
          </div>
          <p style={{ fontSize: '14px', color: '#15803d', marginBottom: 0, marginTop: '10px' }}>
            ✨ View page source to see this was rendered on the server!
          </p>
        </div>
      )}
      
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
      
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: '#fef3c7',
        border: '2px solid #fbbf24',
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '30px auto',
        textAlign: 'left'
      }}>
        <h3 style={{ marginTop: 0, color: '#92400e' }}>🎨 Web Components in JSX</h3>
        <p style={{ color: '#78350f', margin: '10px 0' }}>
          Web Components work seamlessly with React and SSR!
        </p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
          <status-badge status="success" label="SSR"></status-badge>
          <status-badge status="info" label="React"></status-badge>
          <status-badge status="success" label="Vite"></status-badge>
          <status-badge status="warning" label="Web Components"></status-badge>
        </div>
        
        <p style={{ fontSize: '14px', color: '#78350f', marginBottom: 0, marginTop: '15px' }}>
          ✨ These are <strong>vanilla Web Components</strong> (no framework needed)
        </p>
      </div>
      
      <p><a href='https://gasket.dev' target='_blank' rel='noopener noreferrer'>Learn Gasket</a></p>
    </div>
  );
}

export default App;
