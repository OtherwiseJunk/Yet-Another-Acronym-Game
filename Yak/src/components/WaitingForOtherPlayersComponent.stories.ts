import type { Meta, StoryObj } from '@storybook/vue3-vite';
import WaitingForOtherPlayersComponent from './WaitingForOtherPlayersComponent.vue';

const meta: Meta<typeof WaitingForOtherPlayersComponent> = {
    title: 'Game/WaitingForOtherPlayersComponent',
    component: WaitingForOtherPlayersComponent,
    tags: ['autodocs'],
    argTypes: {
        submissionText: { control: 'text' },
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
        submissionText: 'Yet Another Acronym Game',
    },
};

export const LongSubmission: Story = {
    args: {
        submissionText: 'This is a longer sample submission to check wrapping and layout in the waiting screen',
    },
};
