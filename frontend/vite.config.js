import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true
    },
    build: {
        // Target modern browsers for smaller bundles
        target: 'es2015',
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 500,
        // Minification
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info'],
            },
        },
        rollupOptions: {
            output: {
                // Manual code splitting strategy
                manualChunks: {
                    // Vendor chunk - React core
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    // Animation library (large - split separately)
                    'vendor-motion': ['framer-motion'],
                    // Utility libraries
                    'vendor-utils': ['axios', 'react-hot-toast'],
                    // QR Code (only needed on order success page)
                    'vendor-qr': ['qrcode.react'],
                    // Excel export (only needed in admin)
                    'vendor-xlsx': ['xlsx'],
                },
                // Optimize chunk file names
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    if (/\.(gif|jpe?g|png|svg|webp)$/.test(assetInfo.name)) {
                        return 'assets/images/[name]-[hash][extname]';
                    }
                    if (/\.css$/.test(assetInfo.name)) {
                        return 'assets/css/[name]-[hash][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
    },
    // Optimize deps pre-bundling
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'axios', 'framer-motion'],
    },
})
