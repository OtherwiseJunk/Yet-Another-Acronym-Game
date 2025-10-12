import type { Preview } from '@storybook/vue3-vite';
import { setup } from '@storybook/vue3';
import { createPinia } from 'pinia';
import { usePalletteStore } from '../src/stores/palletteStore';

// Create a new Pinia instance for Storybook
const pinia = createPinia();

// Setup Pinia for all stories
setup((app) => {
  app.use(pinia);
  // Initialize a default acronym pallette for stories so components relying on
  // `acronymPallette` (e.g. VotingScreen) have sensible values.
  try {
    const palletteStore = usePalletteStore(pinia);
    palletteStore.setAcronymPallette('YAAG');
  } catch (e) {
    // If initialization fails in certain environments, silently continue —
    // individual stories can still set the pallette as needed.
    // eslint-disable-next-line no-console
    console.warn('Could not initialize pallette store for Storybook', e);
  }
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
