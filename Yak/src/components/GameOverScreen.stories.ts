import type { Meta, StoryObj } from "@storybook/vue3-vite";
import GameOverScreen from "./GameOverScreen.vue";

const meta: Meta<typeof GameOverScreen> = {
  title: "Screens/GameOverScreen",
  component: GameOverScreen,
  tags: ["autodocs"],
  argTypes: {
    scores: { control: "object" },
    players: { control: "object" },
    submissions: { control: "object" },
    playerData: { control: "object" },
    cumulativeTimes: { control: "object" },
    overallFastestPlayerIds: { control: "object" },
    // @ts-ignore
    "play-again": { action: "play-again" },
  },
  decorators: [
    () => ({
      template: `
        <div style="display:flex; align-items:center; justify-content:center; min-height: 100vh; background: #1c1d22; padding: 2em;">
          <story />
        </div>
      `,
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const avatarBase = "https://cdn.discordapp.com/avatars";
const decoBase = "https://cdn.discordapp.com/avatar-decoration-presets";

const playerOne = {
  displayName: "Player One",
  avatarUrl: `${avatarBase}/94545463906144256/a_63f36b768efe0b123ba6f30b2b7a0b36.gif`,
  decorationUrl: `${decoBase}/a_10b9f886b513b77ccdd67c8784f1a496.png?size=96`,
};

const playerTwo = {
  displayName: "Player Two",
  avatarUrl: `${avatarBase}/151162710757867521/a_f60be715d1833313fee80271cad1fe93.gif`,
  decorationUrl: `${decoBase}/a_8cc332adf35835714b1df8f117dc631f.png?size=96`,
};

const playerThree = {
  displayName: "Player Three",
  avatarUrl: `${avatarBase}/93923498241564672/a_6ef0e6634a4de73acf45976afcafadf5.gif`,
  decorationUrl: `${decoBase}/a_43e27922fbe63cb7ae740d3d562584c2.png?size=96`,
};

const playerFour = {
  displayName: "Quick Quinn",
  avatarUrl: playerOne.avatarUrl,
  decorationUrl: "",
};

const makeSubmission = (
  user: { displayName: string; avatarUrl: string; decorationUrl: string },
  text: string,
) => ({
  user_data: user,
  submission: text,
  answer_time: 0,
});

const fourPlayerSubmissions = {
  "1": makeSubmission(playerOne, "Yet Another Acronym Game"),
  "2": makeSubmission(playerTwo, "Yawning Alpacas Always Giggle"),
  "3": makeSubmission(playerThree, "Yonder Apples Are Good"),
  "4": makeSubmission(playerFour, "Yellow Yaks Across Grass"),
};

// Normal leaderboard — varied scores, varied cumulative times, single fastest.
export const Default_FourPlayers: Story = {
  args: {
    players: ["1", "2", "3", "4"],
    scores: { "1": 9, "2": 6, "3": 4, "4": 2 },
    submissions: fourPlayerSubmissions,
    cumulativeTimes: { "1": 42.3, "2": 51.7, "3": 88.2, "4": 35.9 },
    overallFastestPlayerIds: ["4"],
  },
};

// Two players tied for lowest cumulative time — both get the ⚡ badge.
export const Overall_Fastest_Tie: Story = {
  args: {
    players: ["1", "2", "3", "4"],
    scores: { "1": 7, "2": 5, "3": 3, "4": 3 },
    submissions: fourPlayerSubmissions,
    cumulativeTimes: { "1": 40.0, "2": 52.0, "3": 40.0, "4": 61.5 },
    overallFastestPlayerIds: ["1", "3"],
  },
};

// The 1st-place scoring winner is also the overall-fastest — gold tier + flame.
export const Overall_Fastest_Is_Winner: Story = {
  args: {
    players: ["1", "2", "3", "4"],
    scores: { "1": 11, "2": 4, "3": 3, "4": 2 },
    submissions: fourPlayerSubmissions,
    cumulativeTimes: { "1": 30.5, "2": 47.2, "3": 60.8, "4": 71.4 },
    overallFastestPlayerIds: ["1"],
  },
};

// Smallest valid configuration — timing still looks intentional.
export const Two_Player_Game: Story = {
  args: {
    players: ["1", "2"],
    scores: { "1": 5, "2": 3 },
    submissions: {
      "1": fourPlayerSubmissions["1"],
      "2": fourPlayerSubmissions["2"],
    },
    cumulativeTimes: { "1": 22.1, "2": 29.7 },
    overallFastestPlayerIds: ["1"],
  },
};
