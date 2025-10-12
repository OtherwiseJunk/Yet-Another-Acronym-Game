import type { Meta, StoryObj } from '@storybook/vue3-vite';
import VotingScreen from './VotingScreen.vue';

const meta: Meta<typeof VotingScreen> = {
    title: 'Screens/VotingScreen',
    component: VotingScreen,
    tags: ['autodocs'],
    argTypes: {
        submissionsByUserId: { control: 'object' },
        resultsMode: { control: 'boolean' },
        skipVoting: { control: 'boolean' },
        timeRemaining: { control: 'number' },
        vote: { action: 'vote' },
        'next-round': { action: 'next-round' },
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

const sampleSubmissions = {
    '1': {
        user_data: {
            id: 1,
            displayName: 'Player One',
            avatarUrl: 'https://cdn.discordapp.com/avatars/94545463906144256/a_63f36b768efe0b123ba6f30b2b7a0b36.gif',
            decorationUrl: 'https://cdn.discordapp.com/avatar-decoration-presets/a_10b9f886b513b77ccdd67c8784f1a496.png?size=96',
        },
        submission: 'Yet Another Acronym Game',
        answer_time: 5,
    },
    '2': {
        user_data: {
            id: 2,
            displayName: 'Player Two',
            avatarUrl: 'https://cdn.discordapp.com/avatars/151162710757867521/a_f60be715d1833313fee80271cad1fe93.gif',
            decorationUrl: 'https://cdn.discordapp.com/avatar-decoration-presets/a_8cc332adf35835714b1df8f117dc631f.png?size=96',
        },
        submission: 'Yawning Alpacas Always Giggle',
        answer_time: 8,
    },
    '3': {
        user_data: {
            id: 3,
            displayName: 'Player Three',
            avatarUrl: 'https://cdn.discordapp.com/avatars/93923498241564672/a_6ef0e6634a4de73acf45976afcafadf5.gif',
            decorationUrl: 'https://cdn.discordapp.com/avatar-decoration-presets/a_43e27922fbe63cb7ae740d3d562584c2.png?size=96',
        },
        submission: 'Yonder Apples Are Good',
        answer_time: 12,
    },
};

export const Default: Story = {
    args: {
        submissionsByUserId: sampleSubmissions,
        resultsMode: false,
        skipVoting: false,
        timeRemaining: 20,
    },
};

export const ResultsMode: Story = {
    args: {
        submissionsByUserId: sampleSubmissions,
        resultsMode: true,
        skipVoting: false,
        timeRemaining: 0,
    },
};

export const SkipVoting: Story = {
    args: {
        submissionsByUserId: sampleSubmissions,
        resultsMode: false,
        skipVoting: true,
        timeRemaining: 0,
    },
};
