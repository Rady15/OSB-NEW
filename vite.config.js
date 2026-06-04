import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        strictPort: true,
        open: true,
        proxy: {
            '/api': {
                target: 'https://ach.runasp.net',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    preview: {
        port: 3000,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'https://ach.runasp.net',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.js',
        css: false
    }
})
