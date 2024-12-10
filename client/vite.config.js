import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/test': 'http://localhost:5000',
    },
    port: 3000 // Specify your desired port here
  }

})