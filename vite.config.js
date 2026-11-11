import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // En desarrollo (`npm run dev`) no hay nginx delante: el servidor de
      // Vite delega /api al backend, que Docker Compose publica en loopback.
      '/api': 'http://localhost:5000',
      // Socket.IO mantiene su path real; NestJS lo expone en /realtime/socket.io.
      '/realtime/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
      // El health externo de nginx vive en /realtime/health, pero NestJS lo
      // publica en /health.
      '/realtime/health': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace('/realtime/health', '/health'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/*.{test,spec}.{js,jsx}', 'src/test/**'],
      reporter: ['text', 'json-summary', 'lcov'],
      thresholds: { lines: 80 },
    },
  },
})
