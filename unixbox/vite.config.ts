import { defineConfig } from 'vite'

export default defineConfig({
  // Development server configuration
  server: {
    port: 3000,
    cors: true,
    headers: {
      // Enable CORS for all requests
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      // Critical: Enable HTTP Range requests for disk images
      'Accept-Ranges': 'bytes',
    },
  },

  // Build configuration
  build: {
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Ensure proper code splitting
        manualChunks: {
          'xterm': ['xterm', 'xterm-addon-fit', 'xterm-addon-web-links'],
        },
      },
    },
  },

  // Public directory configuration
  publicDir: 'public',

  // Optimization configuration
  optimizeDeps: {
    include: ['xterm', 'xterm-addon-fit', 'xterm-addon-web-links'],
  },

  // Asset configuration
  assetsInclude: ['**/*.dsk'],

  // Preview server configuration (for production builds)
  preview: {
    port: 3000,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      'Accept-Ranges': 'bytes',
    },
  },
})
