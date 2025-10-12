import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AnswerSubmissionScreen from './AnswerSubmissionScreen.vue';

const meta: Meta<typeof AnswerSubmissionScreen> = {
    title: 'Screens/AnswerSubmissionScreen',
    component: AnswerSubmissionScreen,
    tags: ['autodocs'],
    argTypes: {
        acronym: { control: 'text' },
        timeRemaining: { control: 'number' },
        onSubmit: { action: 'submitted' }, // To log the submit event
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
        acronym: 'YAAG',
        timeRemaining: 30,
    },
};

export const Submittable: Story = {
    ...Default, // Inherit args from Default
    // play function removed
};

export const Submitted: Story = {
    ...Default,
    // play function removed
};
