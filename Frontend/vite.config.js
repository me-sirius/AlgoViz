import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 2000,
    // Use esbuild for faster builds (default)
    minify: 'esbuild',
    // Disable source maps for smaller builds
    sourcemap: false,
    // Target modern browsers for smaller output
    target: 'es2020',
    // Handle CommonJS modules properly
    commonjsOptions: {
      // Transform mixed ES/CommonJS modules
      transformMixedEsModules: true,
      // Include patterns for CommonJS detection
      include: [/node_modules/],
      // Extensions to treat as CommonJS
      extensions: ['.js', '.cjs'],
      // Ignore problematic modules
      ignoreTryCatch: true,
    },
  },

  server: {
    host: true,
    allowedHosts: [
      'dorthey-unshort-concealingly.ngrok-free.dev'
    ]
  },

  // Optimize dependencies - pre-bundle CommonJS modules
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      'axios',
      // Pre-bundle problematic CommonJS modules
      'cytoscape',
      'cytoscape-cose-bilkent',
    ],
    // Force re-optimization
    force: true,
  },
});
