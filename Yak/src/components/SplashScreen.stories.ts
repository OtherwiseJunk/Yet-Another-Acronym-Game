import type { Meta, StoryObj } from '@storybook/vue3-vite';
import SplashScreen from './SplashScreen.vue';

const meta: Meta<typeof SplashScreen> = {
    title: 'Screens/SplashScreen',
    component: SplashScreen,
    tags: ['autodocs'],
    // We can define the events that the component emits
    // so that they appear in the Storybook actions panel.
    argTypes: {
        'onAnimationComplete': { action: 'animation-complete' },
        onStart: { action: 'start' },
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

// The component has no props, so we just render it.
// Its internal timeouts will control the animation.
export const Default: Story = {};
