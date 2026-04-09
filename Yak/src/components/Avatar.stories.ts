import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Avatar from "./Avatar.vue";
import { ref } from "vue";

const meta: Meta<typeof Avatar> = {
  title: "Game/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    avatarUrl: { control: "text" },
    avatarDecorationUrl: { control: "text" },
    shouldAnimate: { control: "boolean" },
    size: { control: { type: "range", min: 20, max: 128, step: 4 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleAvatarUrl =
  "https://cdn.discordapp.com/avatars/94545463906144256/a_63f36b768efe0b123ba6f30b2b7a0b36.webp?size=128";
const sampleAnimatedAvatarUrl =
  "https://cdn.discordapp.com/avatars/94545463906144256/a_63f36b768efe0b123ba6f30b2b7a0b36.gif";
const sampleDecorationUrl =
  "https://cdn.discordapp.com/avatar-decoration-presets/a_10b9f886b513b77ccdd67c8784f1a496.png?size=96";

export const Default: Story = {
  args: {
    avatarUrl: sampleAvatarUrl,
  },
};

export const WithDecoration: Story = {
  args: {
    avatarUrl: sampleAvatarUrl,
    avatarDecorationUrl: sampleDecorationUrl,
  },
};

export const Interactive: Story = {
  render: (args) => ({
    components: { Avatar },
    setup() {
      const shouldAnimate = ref(false);
      return { args, shouldAnimate };
    },
    template: `
            <div @mouseenter="shouldAnimate = true" @mouseleave="shouldAnimate = false" style="display: inline-block;">
                <Avatar v-bind="args" :shouldAnimate="shouldAnimate" />
            </div>
        `,
  }),
  args: {
    avatarUrl: sampleAnimatedAvatarUrl,
    avatarDecorationUrl: sampleDecorationUrl,
  },
};

export const Large: Story = {
  args: {
    avatarUrl: sampleAvatarUrl,
    avatarDecorationUrl: sampleDecorationUrl,
    size: 80,
  },
};

export const LargeInteractive: Story = {
  ...Interactive,
  args: {
    ...Interactive.args,
    size: 80,
  },
};

export const Fallback: Story = {
  args: {
    avatarUrl: undefined,
    avatarDecorationUrl: undefined,
  },
};
