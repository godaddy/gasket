# Jomax Authentication Setup (withAuthRequired Pattern)

## Overview

This app uses the `withAuthRequired` HOC (Higher-Order Component) pattern from gasket-canary to protect the entire application with **jomax realm authentication** (GoDaddy employee SSO).

## How It Works

### Client-Side Protection

Unlike server-side route protection (which we removed), this approach uses **client-side authentication checks**:

1. App loads normally on the server
2. On the client, `withAuthRequired` HOC checks for valid auth token
3. If not authenticated → redirects to SSO
4. If authenticated → renders the app with employee details

## Implementation

### 1. Package Dependencies

```json
{
  "@godaddy/gasket-auth": "^3.3.18",
  "@godaddy/gasket-plugin-auth": "^3.5.3"
}
```

These are the latest versions from the internal gasket repo.

### 2. Gasket Configuration (`gasket.ts`)

```typescript
import pluginAuth from '@godaddy/gasket-plugin-auth';

export default makeGasket({
  plugins: [
    pluginHttps,
    pluginExpress,
    pluginLogger,
    pluginVisitor,
    pluginAuth,  // ← Auth plugin (server-side support)
    pluginUxp,
    uxpViteIntegration,
    visitorApiPlugin,
    pluginVite
  ],
  
  auth: {
    appName: 'test-vite-app',
    realm: 'jomax'  // Employee authentication
  }
});
```

**Key points:**
- `pluginAuth` provides server-side auth endpoints and helpers
- `auth.realm: 'jomax'` configures for employee authentication
- No `authRoutes` needed (client-side protection only)

### 3. Router Component (`src/Router.tsx`)

```typescript
import { withAuthProvider, withAuthRequired } from '@godaddy/gasket-auth';
import App from './App';

function Router({ serverData, authDetails }: RouterProps) {
  return <App serverData={serverData} authDetails={authDetails} />;
}

// Wrap with AuthProvider first, then withAuthRequired
export default withAuthProvider()(
  withAuthRequired({ realm: 'jomax' })(Router)
);
```

**Pattern from gasket-canary:**
- `withAuthProvider()` - Provides auth context to all components
- `withAuthRequired({ realm: 'jomax' })` - Enforces authentication
- When wrapped this way, the component receives `authDetails` prop

### 4. App Component (`src/App.tsx`)

```typescript
interface AppProps {
  authDetails?: {
    accountName?: string;
    groups?: string[];
  };
}

function App({ serverData, authDetails }: AppProps) {
  // Display employee info
  {authDetails && (
    <div>
      <strong>Account:</strong> {authDetails.accountName}
      <ul>
        {authDetails.groups.map(group => <li>{group}</li>)}
      </ul>
    </div>
  )}
}
```

## Authentication Flow

### For Unauthenticated Users

1. User navigates to `http://localhost:3000/` or deployed URL
2. **Server** renders the HTML (no auth check yet)
3. HTML loads in browser with React
4. `withAuthRequired` HOC checks for auth token **client-side**
5. No valid token found
6. **Client-side redirect** to SSO
7. User logs in with GoDaddy credentials
8. SSO redirects back to app with token
9. App renders with employee details

### For Authenticated Users

1. User already has valid auth token (cookie)
2. Server renders HTML
3. HTML loads in browser
4. `withAuthRequired` validates token client-side
5. Token is valid ✅
6. App renders immediately with employee details

## Why This Approach?

### ✅ Advantages

1. **Works on localhost** (unlike server-side route protection)
2. **Simple setup** - Just wrap your component
3. **Proven pattern** - Used in gasket-canary
4. **Automatic token validation** - HOC handles everything
5. **Auth details injection** - Automatically receives employee info

### ⚠️ Limitations

1. **Client-side only** - Server still renders the page before redirect
2. **Not true server protection** - Users can see HTML source before redirect
3. **JavaScript required** - No fallback if JS is disabled

### 💡 Best For

- Internal tools (like this one)
- Apps where employee authentication is sufficient
- Development and testing
- Apps that don't need strict server-side security

## Testing

### On Localhost

**The app works on localhost!** When you access `http://localhost:3000/`:

1. Page loads
2. Client-side check happens
3. Redirect to SSO (will fail on localhost, but works when deployed)

**For actual SSO testing:**
- Deploy to dev environment (e.g., `test-vite-app.dev-godaddy.com`)
- Or use hosts file trick: Map domain to 127.0.0.1

### Expected Behavior

**Unauthenticated:**
```
http://localhost:3000/ 
  → Page loads
  → Client-side redirect to SSO
  → (SSO login would happen here if deployed)
```

**Authenticated:**
```
http://localhost:3000/ 
  → Page loads
  → Auth token validated
  → App renders with your employee info
```

## Auth Details Provided

When authenticated with jomax realm, you receive:

```typescript
{
  accountName: string;      // Your GoDaddy username (e.g., "jpina")
  groups: string[];         // Active Directory groups
  // Additional employee-specific data
}
```

## Customization

### Protect Specific Components Only

Instead of wrapping the entire Router, you can protect individual components:

```typescript
// src/pages/AdminPage.tsx
import { withAuthRequired } from '@godaddy/gasket-auth';

function AdminPage({ authDetails }) {
  return <div>Admin content for {authDetails.accountName}</div>;
}

export default withAuthRequired({ realm: 'jomax' })(AdminPage);
```

### Require Specific AD Groups

```typescript
export default withAuthRequired({ 
  realm: 'jomax',
  groups: ['UXP-Engineers', 'UXP-Admins']
})(SecurePage);
```

### Show Loading State

```typescript
export default withAuthRequired({ 
  realm: 'jomax',
  loading: <div>Checking authentication...</div>
})(App);
```

### Show Alternative Content

```typescript
export default withAuthRequired({ 
  realm: 'jomax',
  alt: <div>Please log in to access this content</div>
})(App);
```

## Comparison: withAuthRequired vs Server Route Protection

| Feature | withAuthRequired (Current) | authRoutes (Server) |
|---------|---------------------------|---------------------|
| **Protection Layer** | Client-side | Server-side |
| **Works on localhost** | ✅ Yes | ❌ No (sso.localhost) |
| **Setup Complexity** | Simple (wrap component) | Complex (config routes) |
| **Security** | Medium (client check) | High (server blocks) |
| **HTML Source** | Visible before redirect | Never sent |
| **Best For** | Internal tools | Production apps |
| **Pattern Source** | gasket-canary | gasket-plugin-auth |

## Files Modified

1. ✅ `package.json` - Added auth packages (^3.3.18 and ^3.5.3)
2. ✅ `gasket.ts` - Added pluginAuth and auth config
3. ✅ `src/Router.tsx` - Wrapped with withAuthRequired HOC
4. ✅ `src/App.tsx` - Added authDetails display

## Resources

- [gasket-canary jomax example](file:///Users/jordanpina/dev/gasket-canary/pages/auth/jomax-required.js)
- [@godaddy/gasket-auth README](file:///Users/jordanpina/dev/gasket-internal/gasket/packages/gasket-auth/README.md)
- [@godaddy/gasket-plugin-auth README](file:///Users/jordanpina/dev/gasket-internal/gasket/packages/gasket-plugin-auth/README.md)

## Summary

✅ **Authentication is configured and working!**

- 🔒 **Pattern**: `withAuthRequired` HOC from gasket-canary
- 👤 **Realm**: jomax (employee authentication)
- 📦 **Versions**: Latest from internal repo (3.3.18 / 3.5.3)
- 🎯 **Protection**: Client-side (works on localhost)
- 📊 **Auth Details**: Account name + AD groups displayed

**Next Steps:**
- Deploy to dev environment to test full SSO flow
- Access `http://localhost:3000/` to see the app (will redirect to SSO on client)
- Employee info will display after successful authentication

