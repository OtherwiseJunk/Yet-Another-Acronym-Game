import type { Meta, StoryObj } from "@storybook/vue3-vite";
import AnimatedTypingComponent from "./AnimatedTypingComponent.vue";

const meta: Meta<typeof AnimatedTypingComponent> = {
  title: "Game/AnimatedTypingComponent",
  component: AnimatedTypingComponent,
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text", description: "The text to be typed" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "Hello, this is a typing animation!",
  },
};
