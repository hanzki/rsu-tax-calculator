/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    viteTsconfigPaths(),
    svgr({
      include: '**/*.svg?react',
    }),
  ],
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    exclude: [
        'node_modules/**/*',
        'rsu-tax-calculator-cdk/**/*'
    ],
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
      ],
    },
  },
  server: {
    open: true,
    "proxy": {
        "/service/data/EXR/D.USD.EUR.SP00.A": "https://sdw-wsrest.ecb.europa.eu"
    }
  }
});
