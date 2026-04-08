import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import WaitingForOtherPlayersComponent from './WaitingForOtherPlayersComponent.vue';

describe('WaitingForOtherPlayersComponent', () => {
    it('should display the waiting message', () => {
        const wrapper = shallowMount(WaitingForOtherPlayersComponent, {
            props: { submissionText: 'My Answer' },
        });

        expect(wrapper.text()).toContain('Submitted! Waiting for other players...');
    });

    it('should display the submission text', () => {
        const wrapper = shallowMount(WaitingForOtherPlayersComponent, {
            props: { submissionText: 'Fancy Llama Answers Grandly' },
        });

        expect(wrapper.text()).toContain('Fancy Llama Answers Grandly');
    });

    it('should handle empty submission text', () => {
        const wrapper = shallowMount(WaitingForOtherPlayersComponent, {
            props: { submissionText: '' },
        });

        expect(wrapper.text()).toContain('Submitted! Waiting for other players...');
    });
});
