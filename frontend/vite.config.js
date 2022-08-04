import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({

  // vite uses this as a prefix for href and src URLs
  base: '/static/',
  build: {
    // this is the folder where vite will generate its output. Make sure django can serve files from here!
    outDir: '../backend/static',
    emptyOutDir: true,
    sourcemap: true, // aids in debugging by giving line numbers and readable code
  },
  plugins: [react()]
})