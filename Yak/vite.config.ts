import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  envDir: '../',
  server: {
    watch: {
      usePolling: true,
     },
     host: true, // Here
     strictPort: true,
     port: 80,
  },
  preview: {
    host: true,
    port: 80
} 
})
