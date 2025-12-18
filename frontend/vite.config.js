import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', '@tabler/icons-react', 'lucide-react'],
          utils: ['axios', 'clsx', 'tailwind-merge'],
          charts: ['chart.js', 'react-chartjs-2'],
          media: ['react-player', 'konva', 'react-konva'],
          markdown: ['react-markdown', 'remark-gfm', 'rehype-highlight'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'framer-motion',
      'lucide-react',
      'react-player',
      'scheduler',
      'react-konva',
      'konva',
    ],
    exclude: [
      'chart.js',
      'three',
    ]
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    port: 4173,
  },
})
