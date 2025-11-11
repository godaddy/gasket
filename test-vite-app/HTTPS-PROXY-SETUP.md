# HTTPS Proxy Setup for Local Development

## Overview

This app uses the `@gasket/plugin-https-proxy` to enable local development with a gasket-type hostname on `dev-godaddy.com`. This is essential for testing features that require a GoDaddy domain, such as SSO authentication.

## Why Do We Need This?

- **SSO Authentication**: The `jomax` realm (employee SSO) only works on `*.dev-godaddy.com` domains
- **Secure Cookies**: Many features require HTTPS and secure cookies
- **Domain-specific Features**: Some integrations only work on specific domains

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  https://local.gasket.dev-godaddy.com:8443                  │
│  (HTTPS Proxy Server)                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Forwards requests to...
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  http://localhost:3000                                       │
│  (Main Vite App Server)                                     │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install `@gasket/plugin-https-proxy`, `concurrently`, and the certificate plugins.

### 2. Start the App

Run **one command** to start both servers:

```bash
npm run local
```

This uses `concurrently` to run both:
- **Main Vite App Server** on `localhost:3000`
- **HTTPS Proxy Server** on `https://local.gasket.dev-godaddy.com:8443`

### 3. Access the App

Open your browser to:

```
https://local.gasket.dev-godaddy.com:8443
```

**Note:** You may see a certificate warning in your browser. This is normal for local development. Click "Advanced" → "Proceed to site" (or similar) to continue.

## Configuration

The proxy is configured in `gasket.ts`:

```typescript
httpsProxy: {
  protocol: 'https',
  hostname: 'local.gasket.dev-godaddy.com',
  port: 8443,
  xfwd: true,
  ws: true,
  target: {
    host: 'localhost',
    port: 3000
  }
}
```

### Key Settings:

- **`hostname`**: The dev-godaddy.com hostname to use
- **`port`**: The HTTPS proxy port (8443)
- **`target.port`**: The main app server port (3000)
- **`xfwd`**: Forward request headers (important for preserving original request info)
- **`ws`**: Enable WebSocket support (for HMR)

## Testing SSO Authentication

With the proxy running, you can now test jomax authentication:

1. Access: `https://local.gasket.dev-godaddy.com:8443`
2. The app will check your authentication status
3. If not authenticated, you'll see the "Not Authenticated" message
4. The auth check will call `/api/auth/validate?realm=jomax`
5. On a proper dev domain (not localhost), this would redirect you to SSO

### Why Authentication Still Won't Work Locally

Even with the proxy, authentication may still not fully work locally because:

1. **SSO cookies are domain-specific**: SSO cookies are set for `.dev-godaddy.com` and may not be accessible from `local.*` subdomains
2. **Network configuration**: You may need to configure your `/etc/hosts` file
3. **VPN/network access**: Some SSO features require being on the GoDaddy network or VPN

### To Fully Test Authentication:

Deploy to a proper dev environment:
- `your-app.dev-godaddy.com`
- `your-app.test.int.dev-godaddy.com`
- Or other approved dev domains

## Troubleshooting

### Browser Shows "Connection Not Secure"

This is normal. The proxy uses self-signed certificates for local development. Click through the warning to proceed.

### Cannot Access the Hostname

Make sure:
1. Both servers are running (main app + proxy)
2. No firewall is blocking port 8443
3. You're using `https://` not `http://`

### WebSocket/HMR Not Working

The `ws: true` option should enable WebSocket support. If HMR still doesn't work, you may need to refresh the page manually after code changes.

## Switching Between Localhost and Proxy

You can develop using either:

- **Localhost (no auth)**: `http://localhost:3000` - Faster, no certificate warnings, but no auth
- **Proxy (with domain)**: `https://local.gasket.dev-godaddy.com:8443` - Slower, certificate warnings, but proper domain for testing

Use localhost for general development and the proxy only when you need to test domain-specific features.

## Related Files

- `gasket.ts` - Proxy configuration
- `proxy-server.ts` - Proxy server startup script
- `package.json` - Contains `npm run proxy` script
- `server.ts` - Main app server

## Learn More

- [@gasket/plugin-https-proxy Documentation](https://github.com/godaddy/gasket/tree/main/packages/gasket-plugin-https-proxy)
- [http-proxy Options](https://www.npmjs.com/package/http-proxy#options)

