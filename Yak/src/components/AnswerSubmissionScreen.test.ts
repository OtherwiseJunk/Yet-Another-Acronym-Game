import { describe, it, expect, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AnswerSubmissionScreen from './AnswerSubmissionScreen.vue';
import { Color } from '../models/color';

// Stub the composable so we don't need a real background color
vi.mock('../composables/useDynamicTextColor', () => ({
    useDynamicTextColor: () => ({ value: 'white' })
}));

describe('AnswerSubmissionScreen - letterArray reactivity', () => {
    it('letterArray should update when the acronym prop changes', async () => {
        setActivePinia(createPinia());
        const colors = [
            new Color('#FF0000', ['#FF3300', '#FF6600', '#FF9900', '#FFCC00']),
            new Color('#00FF00', ['#33FF33', '#66FF66', '#99FF99', '#CCFFCC']),
            new Color('#0000FF', ['#3333FF', '#6666FF', '#9999FF', '#CCCCFF']),
        ];

        const wrapper = shallowMount(AnswerSubmissionScreen, {
            props: { acronym: 'ABC', timeRemaining: 60, colorPallette: colors },
        });

        const acronymComponent = wrapper.findComponent({ name: 'Acronym' });
        expect(acronymComponent.props('letterArray')).toEqual(['A', 'B', 'C']);

        // Simulate a new round — acronym changes
        await wrapper.setProps({ acronym: 'XYZ', timeRemaining: 60, colorPallette: colors });

        // letterArray should reflect the new acronym
        expect(acronymComponent.props('letterArray')).toEqual(['X', 'Y', 'Z']);
    });
});
