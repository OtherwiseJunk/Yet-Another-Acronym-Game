import type { Meta, StoryObj } from "@storybook/vue3-vite";
import AnswerSubmissionScreen from "./AnswerSubmissionScreen.vue";

const meta: Meta<typeof AnswerSubmissionScreen> = {
  title: "Screens/AnswerSubmissionScreen",
  component: AnswerSubmissionScreen,
  tags: ["autodocs"],
  argTypes: {
    acronym: { control: "text" },
    timeRemaining: { control: "number" },
    submissions: { control: "object" },
    players: { control: "object" },
    onSubmit: { action: "submitted" },
  },
  decorators: [
    () => ({
      template: `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #1c1d22; padding: 2em;">
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
    acronym: "YAAG",
    timeRemaining: 30,
    submissions: {},
    players: ["999", "1", "2", "3"],
  },
};

export const Submittable: Story = {
  ...Default,
};

export const Submitted: Story = {
  ...Default,
};

// Shows how the screen looks while many other players are still submitting
// and the local player hasn't yet. (The post-submit WaitingState is covered
// by dedicated stories in WaitingForOtherPlayersComponent.)
export const OthersAlreadySubmitted: Story = {
  args: {
    acronym: "YAAG",
    timeRemaining: 14,
    submissions: {
      "1": {
        user_data: { displayName: "Alice", avatarUrl: "", decorationUrl: "" },
        submission: "Yet Another Acronym Game",
        answer_time: 6,
      },
      "2": {
        user_data: { displayName: "Bob", avatarUrl: "", decorationUrl: "" },
        submission: "Yawning Alpacas Always Giggle",
        answer_time: 9,
      },
    },
    players: ["999", "1", "2", "3"],
  },
};
