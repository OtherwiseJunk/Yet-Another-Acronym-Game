import type { Meta, StoryObj } from "@storybook/vue3-vite";
import FloatingActions from "./FloatingActions.vue";

const meta: Meta<typeof FloatingActions> = {
  title: "Game/FloatingActions",
  component: FloatingActions,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template: `
        <div style="position: relative; background-color: #000; min-height: 400px; width: 100%;">
          <story />
        </div>
      `,
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnLightBackground: Story = {
  decorators: [
    () => ({
      template: `
        <div style="position: relative; background-color: #ffffff; min-height: 400px; width: 100%;">
          <story />
        </div>
      `,
    }),
  ],
};
