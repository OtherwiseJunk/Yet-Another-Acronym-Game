import type { Meta, StoryObj } from "@storybook/vue3-vite";
import VotingScreen from "./VotingScreen.vue";

const meta: Meta<typeof VotingScreen> = {
  title: "Screens/VotingScreen",
  component: VotingScreen,
  tags: ["autodocs"],
  argTypes: {
    submissionsByUserId: { control: "object" },
    resultsMode: { control: "boolean" },
    skipVoting: { control: "boolean" },
    timeRemaining: { control: "number" },
    acronym: { control: "text" },
    colorPallette: { control: "object" },
    // @ts-ignore
    vote: { action: "vote" },
    "next-round": { action: "next-round" },
  },
  decorators: [
    () => ({
      template: `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #1c1d22; padding: 2em; min-height: 50vh;">
                    <story />
                </div>
            `,
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ── Shared test data ────────────────────────────────────────────────

const avatarBase = "https://cdn.discordapp.com/avatars";
const decoBase = "https://cdn.discordapp.com/avatar-decoration-presets";

const playerOne = {
  id: 1,
  displayName: "Player One",
  avatarUrl: `${avatarBase}/94545463906144256/a_63f36b768efe0b123ba6f30b2b7a0b36.gif`,
  decorationUrl: `${decoBase}/a_10b9f886b513b77ccdd67c8784f1a496.png?size=96`,
};

const playerTwo = {
  id: 2,
  displayName: "Player Two",
  avatarUrl: `${avatarBase}/151162710757867521/a_f60be715d1833313fee80271cad1fe93.gif`,
  decorationUrl: `${decoBase}/a_8cc332adf35835714b1df8f117dc631f.png?size=96`,
};

const playerThree = {
  id: 3,
  displayName: "Player Three",
  avatarUrl: `${avatarBase}/93923498241564672/a_6ef0e6634a4de73acf45976afcafadf5.gif`,
  decorationUrl: `${decoBase}/a_43e27922fbe63cb7ae740d3d562584c2.png?size=96`,
};

const threePlayerSubmissions = {
  "1": {
    user_data: playerOne,
    submission: "Yet Another Acronym Game",
    answer_time: 5,
  },
  "2": {
    user_data: playerTwo,
    submission: "Yawning Alpacas Always Giggle",
    answer_time: 8,
  },
  "3": {
    user_data: playerThree,
    submission: "Yonder Apples Are Good",
    answer_time: 12,
  },
};

// ── Voting phase stories ────────────────────────────────────────────

export const Default: Story = {
  args: {
    submissionsByUserId: threePlayerSubmissions,
    resultsMode: false,
    skipVoting: false,
    timeRemaining: 20,
    acronym: "YAAG",
  },
};

export const TimerAlmostExpired: Story = {
  args: {
    submissionsByUserId: threePlayerSubmissions,
    resultsMode: false,
    skipVoting: false,
    timeRemaining: 3,
    acronym: "YAAG",
  },
};

export const TwoPlayers: Story = {
  args: {
    submissionsByUserId: {
      "1": threePlayerSubmissions["1"],
      "2": threePlayerSubmissions["2"],
    },
    resultsMode: false,
    skipVoting: false,
    timeRemaining: 15,
    acronym: "YAAG",
  },
};

export const SixPlayers: Story = {
  args: {
    submissionsByUserId: {
      ...threePlayerSubmissions,
      "4": {
        user_data: {
          id: 4,
          displayName: "SpeedDemon",
          avatarUrl: playerOne.avatarUrl,
          decorationUrl: "",
        },
        submission: "Yaks Ate All Grass",
        answer_time: 3,
      },
      "5": {
        user_data: {
          id: 5,
          displayName: "SlowAndSteady",
          avatarUrl: playerTwo.avatarUrl,
          decorationUrl: "",
        },
        submission: "Yesterday's Antics Are Gone",
        answer_time: 45,
      },
      "6": {
        user_data: {
          id: 6,
          displayName: "LastMinuteLarry",
          avatarUrl: playerThree.avatarUrl,
          decorationUrl: "",
        },
        submission: "Yelling About Awful Guacamole",
        answer_time: 58,
      },
    },
    resultsMode: false,
    skipVoting: false,
    timeRemaining: 20,
    acronym: "YAAG",
  },
};

export const LongSubmissions: Story = {
  args: {
    submissionsByUserId: {
      "1": {
        user_data: playerOne,
        submission:
          "Youthful Ambitious Astronauts Gracefully Blasting Into Zany Kaleidoscopic Realms",
        answer_time: 30,
      },
      "2": {
        user_data: playerTwo,
        submission:
          "Yearning Aimlessly Around Galaxies Before Investigating Zealous Koala Restaurants",
        answer_time: 42,
      },
      "3": {
        user_data: playerThree,
        submission:
          "Yellow Armadillos Accidentally Generated Brilliant Ideas Zapping Keyboard Rhythms",
        answer_time: 55,
      },
    },
    resultsMode: false,
    skipVoting: false,
    timeRemaining: 10,
    acronym: "YAAGBIZKR",
  },
};

export const ShortAcronym: Story = {
  args: {
    submissionsByUserId: {
      "1": {
        user_data: playerOne,
        submission: "Fun Big Cat",
        answer_time: 2,
      },
      "2": {
        user_data: playerTwo,
        submission: "Fancy Blue Candle",
        answer_time: 4,
      },
      "3": {
        user_data: playerThree,
        submission: "Fried Banana Chunks",
        answer_time: 7,
      },
    },
    resultsMode: false,
    skipVoting: false,
    timeRemaining: 18,
    acronym: "FBC",
  },
};

export const CloseAnswerTimes: Story = {
  args: {
    submissionsByUserId: {
      "1": {
        user_data: playerOne,
        submission: "Yet Another Acronym Game",
        answer_time: 10,
      },
      "2": {
        user_data: playerTwo,
        submission: "Yawning Alpacas Always Giggle",
        answer_time: 11,
      },
      "3": {
        user_data: playerThree,
        submission: "Yonder Apples Are Good",
        answer_time: 11,
      },
    },
    resultsMode: false,
    skipVoting: false,
    timeRemaining: 14,
    acronym: "YAAG",
  },
};

// ── Skip voting story ───────────────────────────────────────────────

export const SkipVoting: Story = {
  args: {
    submissionsByUserId: threePlayerSubmissions,
    resultsMode: false,
    skipVoting: true,
    timeRemaining: 0,
    acronym: "YAAG",
  },
};

// ── Results phase stories ───────────────────────────────────────────

export const ResultsMode: Story = {
  args: {
    submissionsByUserId: threePlayerSubmissions,
    resultsMode: true,
    skipVoting: false,
    timeRemaining: 0,
    acronym: "YAAG",
  },
};

export const ResultsTwoPlayers: Story = {
  args: {
    submissionsByUserId: {
      "1": threePlayerSubmissions["1"],
      "2": threePlayerSubmissions["2"],
    },
    resultsMode: true,
    skipVoting: true,
    timeRemaining: 0,
    acronym: "YAAG",
  },
};

export const ResultsSixPlayers: Story = {
  args: {
    submissionsByUserId: {
      ...threePlayerSubmissions,
      "4": {
        user_data: {
          id: 4,
          displayName: "SpeedDemon",
          avatarUrl: playerOne.avatarUrl,
          decorationUrl: "",
        },
        submission: "Yaks Ate All Grass",
        answer_time: 3,
      },
      "5": {
        user_data: {
          id: 5,
          displayName: "SlowAndSteady",
          avatarUrl: playerTwo.avatarUrl,
          decorationUrl: "",
        },
        submission: "Yesterday's Antics Are Gone",
        answer_time: 45,
      },
      "6": {
        user_data: {
          id: 6,
          displayName: "LastMinuteLarry",
          avatarUrl: playerThree.avatarUrl,
          decorationUrl: "",
        },
        submission: "Yelling About Awful Guacamole",
        answer_time: 58,
      },
    },
    resultsMode: true,
    skipVoting: false,
    timeRemaining: 0,
    acronym: "YAAG",
  },
};

export const ResultsLongSubmissions: Story = {
  args: {
    submissionsByUserId: {
      "1": {
        user_data: playerOne,
        submission:
          "Youthful Ambitious Astronauts Gracefully Blasting Into Zany Kaleidoscopic Realms",
        answer_time: 30,
      },
      "2": {
        user_data: playerTwo,
        submission:
          "Yearning Aimlessly Around Galaxies Before Investigating Zealous Koala Restaurants",
        answer_time: 42,
      },
      "3": {
        user_data: playerThree,
        submission:
          "Yellow Armadillos Accidentally Generated Brilliant Ideas Zapping Keyboard Rhythms",
        answer_time: 55,
      },
    },
    resultsMode: true,
    skipVoting: false,
    timeRemaining: 0,
    acronym: "YAAGBIZKR",
  },
};

export const SingleSubmission: Story = {
  args: {
    submissionsByUserId: {
      "1": {
        user_data: playerOne,
        submission: "Yet Another Acronym Game",
        answer_time: 5,
      },
    },
    resultsMode: true,
    skipVoting: true,
    timeRemaining: 0,
    acronym: "YAAG",
  },
};

export const ResultsNoDecorations: Story = {
  args: {
    submissionsByUserId: {
      "1": {
        user_data: {
          id: 1,
          displayName: "NoDeco1",
          avatarUrl: playerOne.avatarUrl,
          decorationUrl: "",
        },
        submission: "Yet Another Acronym Game",
        answer_time: 5,
      },
      "2": {
        user_data: {
          id: 2,
          displayName: "NoDeco2",
          avatarUrl: playerTwo.avatarUrl,
          decorationUrl: "",
        },
        submission: "Yawning Alpacas Always Giggle",
        answer_time: 8,
      },
    },
    resultsMode: true,
    skipVoting: true,
    timeRemaining: 0,
    acronym: "YAAG",
  },
};

// ── Scoring showcase stories (§5) ────────────────────────────────────

// Winner card also has the fastest submission with votes → badges stack.
// player-1 is the winner AND the fastest-with-votes (answer_time=5 beats 8, 12).
export const Results_WinnerAndFastest_AreSamePlayer: Story = {
  args: {
    submissionsByUserId: threePlayerSubmissions,
    resultsMode: true,
    skipVoting: false,
    timeRemaining: 0,
    acronym: "YAAG",
    lastRoundScoring: {
      "1": {
        votes_received: 2,
        voted_for_winner: 0,
        speed_bonus: 1,
        total: 3,
        is_winner: true,
      },
      "2": {
        votes_received: 0,
        voted_for_winner: 1,
        speed_bonus: 0,
        total: 1,
        is_winner: false,
      },
      "3": {
        votes_received: 0,
        voted_for_winner: 1,
        speed_bonus: 0,
        total: 1,
        is_winner: false,
      },
    },
    lastRoundWinnerId: "1",
  },
};

// Winner (player-2) is NOT the fastest submitter with votes — player-1 is.
// So 👑 lands on one card, ⚡ on another — visually separate.
export const Results_WinnerAndFastest_Different: Story = {
  args: {
    submissionsByUserId: threePlayerSubmissions,
    resultsMode: true,
    skipVoting: false,
    timeRemaining: 0,
    acronym: "YAAG",
    lastRoundScoring: {
      "1": {
        votes_received: 1,
        voted_for_winner: 0,
        speed_bonus: 1,
        total: 2,
        is_winner: false,
      },
      "2": {
        votes_received: 2,
        voted_for_winner: 0,
        speed_bonus: 0,
        total: 2,
        is_winner: true,
      },
      "3": {
        votes_received: 0,
        voted_for_winner: 1,
        speed_bonus: 0,
        total: 1,
        is_winner: false,
      },
    },
    lastRoundWinnerId: "2",
  },
};

// Current viewer (discord store id "999" per storybook preview) voted for the
// winner (player-2), so the "+1 pt — you voted for the winner" banner renders.
export const Results_VoterRewardBanner: Story = {
  args: {
    submissionsByUserId: threePlayerSubmissions,
    resultsMode: true,
    skipVoting: false,
    timeRemaining: 0,
    acronym: "YAAG",
    lastRoundScoring: {
      "1": {
        votes_received: 1,
        voted_for_winner: 0,
        speed_bonus: 1,
        total: 2,
        is_winner: false,
      },
      "2": {
        votes_received: 2,
        voted_for_winner: 0,
        speed_bonus: 0,
        total: 2,
        is_winner: true,
      },
      "3": {
        votes_received: 0,
        voted_for_winner: 0,
        speed_bonus: 0,
        total: 0,
        is_winner: false,
      },
    },
    lastRoundWinnerId: "2",
    votes: {
      "999": "2",
      "1": "2",
      "3": "1",
    },
  },
};

// Edge case: nobody got any votes this round — no winner, no speed bonus,
// no fiery aura anywhere. Proves the "≥1 vote" gate.
export const Results_Tied_FastestGotZeroVotes: Story = {
  args: {
    submissionsByUserId: threePlayerSubmissions,
    resultsMode: true,
    skipVoting: false,
    timeRemaining: 0,
    acronym: "YAAG",
    lastRoundScoring: {
      "1": {
        votes_received: 0,
        voted_for_winner: 0,
        speed_bonus: 0,
        total: 0,
        is_winner: false,
      },
      "2": {
        votes_received: 0,
        voted_for_winner: 0,
        speed_bonus: 0,
        total: 0,
        is_winner: false,
      },
      "3": {
        votes_received: 0,
        voted_for_winner: 0,
        speed_bonus: 0,
        total: 0,
        is_winner: false,
      },
    },
    lastRoundWinnerId: null,
  },
};
