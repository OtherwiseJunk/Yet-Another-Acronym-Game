/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [vue()],
  envDir: '../',
  base: '/',
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
          environment: 'jsdom',
        }
      }],
    coverage: {
      include: ['src/**'],
      exclude: [
        'src/**/*.stories.ts',
        'src/**/*.test.ts',
        'src/main.ts',
        'src/vite-env.d.ts',
        'src/models/Discord/authenticationResponse.ts',
        'src/models/CableCommands/command.interface.ts',
      ],
    },
  }
});
