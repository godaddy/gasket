import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  server: {
    // Allow requests from the HTTPS proxy hostname
    allowedHosts: [
      'local.gasket.dev-godaddy.com',
      'local.gasket.dev-secureserver.net',
      'local.gasket.dev-gdcorp.tools',
      'local.gasket.int.dev-gdcorp.tools'
    ]
  },
  
  build: {
    // SSR build configuration
    // When running "vite build --ssr", this outputs the server bundle
    rollupOptions: {
      input: {
        // Client entry
        client: './src/entry-client.tsx',
        // Server entry (for SSR)
        server: './src/entry-server.tsx'
      }
    }
  }
});

