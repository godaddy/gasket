import { withAuthProvider } from '@godaddy/gasket-auth';
import App from './App';

interface RouterProps {
  serverData?: any;
}

/**
 * Simple Router component for Vite
 * Auth checking happens in App component using useAuthState hook
 */
function Router({ serverData }: RouterProps) {
  return <App serverData={serverData} />;
}

// Wrap with AuthProvider to enable auth context throughout the app
export default withAuthProvider()(Router);
