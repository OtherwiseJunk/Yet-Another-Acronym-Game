import type { Meta, StoryObj } from "@storybook/vue3-vite";
import WaitingForOtherPlayersComponent from "./WaitingForOtherPlayersComponent.vue";

const meta: Meta<typeof WaitingForOtherPlayersComponent> = {
  title: "Game/WaitingForOtherPlayersComponent",
  component: WaitingForOtherPlayersComponent,
  tags: ["autodocs"],
  argTypes: {
    submissionText: { control: "text" },
    submittedCount: { control: "number" },
    totalPlayers: { control: "number" },
    timeRemaining: { control: "number" },
  },
  decorators: [
    () => ({
      template: `
        <div style="display:flex; align-items:center; justify-content:center; height: 100vh; background: #1c1d22; padding: 2em;">
          <story />
        </div>
      `,
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    submissionText: "Yet Another Acronym Game",
    submittedCount: 2,
    totalPlayers: 4,
    timeRemaining: 17,
  },
};

export const JustSubmitted: Story = {
  args: {
    submissionText: "Yet Another Acronym Game",
    submittedCount: 1,
    totalPlayers: 4,
    timeRemaining: 22,
  },
};

export const AlmostEveryone: Story = {
  args: {
    submissionText: "Youthful Apples Aren't Green",
    submittedCount: 3,
    totalPlayers: 4,
    timeRemaining: 6,
  },
};

export const Solo: Story = {
  args: {
    submissionText: "Solo Submission",
    submittedCount: 1,
    totalPlayers: 1,
    timeRemaining: 18,
  },
};

export const LongSubmission: Story = {
  args: {
    submissionText:
      "This is a longer sample submission to check wrapping and layout in the waiting screen",
    submittedCount: 2,
    totalPlayers: 4,
    timeRemaining: 12,
  },
};
