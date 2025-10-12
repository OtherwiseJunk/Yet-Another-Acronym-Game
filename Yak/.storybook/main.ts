import type { StorybookConfig } from '@storybook/vue3-vite';
import { UserConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  "framework": {
    "name": "@storybook/vue3-vite",
    "options": {}
  }
};

// Use viteFinal to add an alias so Storybook imports the stub for the Discord SDK.
// This keeps the app code unchanged while isolating the real SDK from stories.
config.viteFinal = async (config: UserConfig) => {
  config.resolve = config.resolve || {};
  config.resolve.alias = config.resolve.alias || [];
  // add an alias mapping to our stub file
  config.resolve.alias.push({
    find: '@discord/embedded-app-sdk',
    replacement: path.resolve(__dirname, './discord-sdk-stub.ts')
  });
  return config;
};
export default config;
