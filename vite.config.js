import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Set the base URL for the app (use relative paths)
  build: {
    outDir: 'dist', // Optional, but this ensures the build folder is named correctly
  },
  server: {
    // Handle SPA routing and fallback for routes to index.html
    historyApiFallback: true,
  },
})
