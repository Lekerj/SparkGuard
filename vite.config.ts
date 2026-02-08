import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // MET Norway Locationforecast — proxy to add required User-Agent header
      '/api/met': {
        target: 'https://api.met.no/weatherapi',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/met/, ''),
        headers: {
          'User-Agent': 'SparkGuard/1.0 github.com/sparkguard',
        },
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three'],
          'globe-vendor': ['react-globe.gl'],
        },
      },
    },
  },
})
