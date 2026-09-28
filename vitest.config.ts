import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 15000,
    env: {
      MOCK_CORE_API: 'true',
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/server/repositories/system.repository.ts',
        'src/server/services/health.service.ts',
        'src/server/controllers/health.controller.ts',
        'src/server/di/registry.ts',
        'src/components/atoms/Badge/Badge.tsx',
        'src/components/atoms/Button/Button.tsx',
        'src/components/atoms/Modal/Modal.tsx',
        'src/components/molecules/Callout/Callout.tsx',
        'src/components/organisms/Navbar/Navbar.tsx',
        'src/components/templates/AppLayout/AppLayout.tsx',
        'src/app/page.tsx',
      ],
      thresholds: {
        lines: 60,
        functions: 50,
        branches: 50,
        statements: 60,
      },
    },
  },
});
