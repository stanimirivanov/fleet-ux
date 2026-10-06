import tailwindcss from '@tailwindcss/vite';
import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  // Component tests do not run a hot-reload server.
  plugins: [solid({ hot: mode !== 'test' }), tailwindcss()],
  // Resolve Solid's browser build when Vitest renders components in jsdom.
  resolve: { conditions: ['development', 'browser'] },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
}));
