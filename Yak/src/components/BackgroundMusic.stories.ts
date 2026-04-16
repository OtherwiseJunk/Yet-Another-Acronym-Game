import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BackgroundMusic from "./BackgroundMusic.vue";

const meta: Meta<typeof BackgroundMusic> = {
  title: "Audio/BackgroundMusic",
  component: BackgroundMusic,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template:
        '<div style="padding: 2rem; background: #1a1a2e; min-height: 200px; display: flex; align-items: center; justify-content: center;"><story/></div>',
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
