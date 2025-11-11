import { CSSProperties, useEffect, useState } from 'react';
import { useAuthState } from '@godaddy/gasket-auth';
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
  const [authData, setAuthData] = useState<any>(null);
  
  // Use the useAuthState hook to get authentication status and details
  // This is the recommended approach for Vite apps (non-Next.js)
  const authStateResult = useAuthState({ realm: 'jomax', alt: 'noredirect' });
  
  // Handle async auth state (only run once on mount)
  useEffect(() => {
    // If authStateResult is a Promise, resolve it
    if (authStateResult && typeof authStateResult.then === 'function') {
      console.log('🔐 Auth State is Promise, resolving...');
      authStateResult.then((resolvedAuthState: any) => {
        console.log('🔐 Resolved Auth State:', resolvedAuthState);
        console.log('🔐 Valid:', resolvedAuthState.valid);
        console.log('🔐 Reason:', resolvedAuthState.reason);
        setAuthData(resolvedAuthState);
      });
    } else {
      // If it's already a state object, use it directly
      console.log('🔐 Auth State is object:', authStateResult);
      setAuthData(authStateResult);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount to avoid infinite loop

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
      
        {authData && !authData.valid && (
          <div style={{ 
            marginTop: '30px', 
            padding: '25px', 
            background: '#fff3e0',
            border: '2px solid #ff9800',
            borderRadius: '8px',
            maxWidth: '600px',
            margin: '30px auto',
            textAlign: 'left'
          }}>
            <h3 style={{ marginTop: 0, color: '#e65100' }}>🔒 Not Authenticated</h3>
            <p style={{ color: '#ef6c00', margin: '15px 0' }}>
              You are not currently authenticated with <strong>jomax realm</strong> (GoDaddy employee SSO)
            </p>
            
            <div style={{ 
              background: '#fff', 
              padding: '15px', 
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}>
              <strong>Reason:</strong> {authData.reason}
            </div>
            
            <div style={{ 
              background: '#fffbf0',
              padding: '15px',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <strong>Note:</strong> Jomax authentication doesn't work on localhost. To test authentication:
              <ul style={{ marginTop: '10px', marginBottom: 0 }}>
                <li>Deploy to a dev environment (e.g., dev-godaddy.com)</li>
                <li>Or remove authentication for local development</li>
              </ul>
            </div>
          </div>
        )}
        
        {authData?.valid && authData?.details && (
          <div style={{ 
            marginTop: '30px', 
            padding: '25px', 
            background: '#f0fdf4',
            border: '2px solid #4CAF50',
            borderRadius: '8px',
            maxWidth: '600px',
            margin: '30px auto',
            textAlign: 'left'
          }}>
            <h3 style={{ marginTop: 0, color: '#2e7d32' }}>🔐 Employee Authentication (Jomax)</h3>
            <p style={{ color: '#15803d', margin: '15px 0' }}>
              This app uses <strong>jomax realm authentication</strong> (GoDaddy employee SSO)
            </p>
            
            {authData.details.accountName && (
              <div style={{ 
                background: '#fff', 
                padding: '15px', 
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                <strong>Account:</strong> {authData.details.accountName}
              </div>
            )}
            
            {authData.details.groups && authData.details.groups.length > 0 && (
              <div>
                <p style={{ marginBottom: '10px' }}><strong>Active Directory Groups:</strong></p>
                <div style={{ 
                  background: '#fff', 
                  padding: '15px', 
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {authData.details.groups.map((group: string, index: number) => (
                      <li key={index} style={{ marginBottom: '5px', fontSize: '14px' }}>
                        {group}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <p style={{ fontSize: '14px', color: '#666', marginTop: '15px', marginBottom: 0 }}>
              ✅ You are authenticated via SSO
            </p>
          </div>
        )}
      
      <p><a href='https://gasket.dev' target='_blank' rel='noopener noreferrer'>Learn Gasket</a></p>
    </div>
  );
}

export default App;
