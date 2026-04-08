import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AnswerSubmissionScreen from './AnswerSubmissionScreen.vue';
import { Color } from '../models/color';

vi.mock('../composables/useDynamicTextColor', () => ({
    useDynamicTextColor: () => ({ value: 'white' })
}));

const testColors = [
    new Color('#FF0000', ['#FF3300', '#FF6600', '#FF9900', '#FFCC00']),
    new Color('#00FF00', ['#33FF33', '#66FF66', '#99FF99', '#CCFFCC']),
    new Color('#0000FF', ['#3333FF', '#6666FF', '#9999FF', '#CCCCFF']),
];

describe('AnswerSubmissionScreen - submittable validation', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    function mountWithAcronym(acronym: string) {
        return shallowMount(AnswerSubmissionScreen, {
            props: { acronym, timeRemaining: 60, colorPallette: testColors },
        });
    }

    it('submit button should be disabled when input is empty', () => {
        const wrapper = mountWithAcronym('ABC');
        const button = wrapper.find('button[type="submit"]');

        expect(button.attributes('disabled')).toBeDefined();
    });

    it('submit button should be enabled when input matches acronym', async () => {
        const wrapper = mountWithAcronym('ABC');
        const input = wrapper.find('input[type="text"]');

        await input.setValue('Apples Bananas Cherries');

        const button = wrapper.find('button[type="submit"]');
        expect(button.attributes('disabled')).toBeUndefined();
    });

    it('should reject submissions where word count does not match acronym length', async () => {
        const wrapper = mountWithAcronym('ABC');
        const input = wrapper.find('input[type="text"]');

        await input.setValue('Apples Bananas');
        expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();

        await input.setValue('Apples Bananas Cherries Dates');
        expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    });

    it('should reject submissions where words do not start with correct letters', async () => {
        const wrapper = mountWithAcronym('ABC');
        const input = wrapper.find('input[type="text"]');

        await input.setValue('Xylophone Bananas Cherries');
        expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    });

    it('should be case-insensitive', async () => {
        const wrapper = mountWithAcronym('ABC');
        const input = wrapper.find('input[type="text"]');

        await input.setValue('apples bananas cherries');
        expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
    });

    it('should emit submit event with the answer when form is submitted', async () => {
        const wrapper = mountWithAcronym('AB');
        const input = wrapper.find('input[type="text"]');

        await input.setValue('Apples Bananas');
        await wrapper.find('form').trigger('submit');

        expect(wrapper.emitted('submit')).toBeDefined();
        expect(wrapper.emitted('submit')![0]).toEqual(['Apples Bananas']);
    });

    it('should show waiting screen after submission', async () => {
        const wrapper = mountWithAcronym('AB');
        const input = wrapper.find('input[type="text"]');

        await input.setValue('Apples Bananas');
        await wrapper.find('form').trigger('submit');

        expect(wrapper.findComponent({ name: 'WaitingForOtherPlayersComponent' }).exists()).toBe(true);
    });

    it('should not emit submit when answer is invalid', async () => {
        const wrapper = mountWithAcronym('ABC');
        const input = wrapper.find('input[type="text"]');

        await input.setValue('Wrong Words');
        await wrapper.find('form').trigger('submit');

        expect(wrapper.emitted('submit')).toBeUndefined();
    });

    it('should not allow multiple submissions', async () => {
        const wrapper = mountWithAcronym('AB');
        const input = wrapper.find('input[type="text"]');

        await input.setValue('Apples Bananas');
        await wrapper.find('form').trigger('submit');

        expect(wrapper.emitted('submit')).toHaveLength(1);
    });
});
