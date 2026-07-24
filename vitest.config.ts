import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@litetrace/events': path.resolve(__dirname, 'packages/events/src/index.ts'),
      '@litetrace/types': path.resolve(__dirname, 'packages/types/src/index.ts'),
      '@litetrace/config': path.resolve(__dirname, 'packages/config/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
  },
});
