import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Acronym from './Acronym.vue';
import type { Color } from '../models';

const meta: Meta<typeof Acronym> = {
    title: 'Game/Acronym',
    component: Acronym,
    tags: ['autodocs'],
    argTypes: {
        letterArray: { control: 'object', description: 'Array of letters to display' },
        colors: { control: 'object', description: 'Array of color objects for the letters' },
    },
    // Renders the component in a container to better display it.
    decorators: [() => ({ template: '<div style="height: 300px; position: relative;"><story/></div>' })],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultColors: Color[] = [
    { main: '#42b883', shades: ['#a1d6c0', '#7cc9a9', '#57bb90', '#32ac77'] },
    { main: '#35495e', shades: ['#a3adb6', '#8195a7', '#5f7e98', '#3d6689'] },
    { main: '#f39237', shades: ['#f9c99b', '#f7b577', '#f5a153', '#f38d2f'] },
    { main: '#d63230', shades: ['#eab2b2', '#e28f8e', '#dc6d6b', '#d64a48'] },
];

export const Default: Story = {
    args: {
        letterArray: ['Y', 'A', 'A', 'G'],
        colors: defaultColors,
    },
};

export const LongAcronym: Story = {
    args: {
        letterArray: ['S', 'T', 'O', 'R', 'Y', 'T', 'I', 'M', 'E', '!', ' ', 'G', 'E', 'T', ' ', 'R', 'E', 'A', 'D', 'Y'],
        colors: defaultColors,
    },
};

export const NoLetters: Story = {
    args: {
        letterArray: [],
        colors: defaultColors,
    },
};
