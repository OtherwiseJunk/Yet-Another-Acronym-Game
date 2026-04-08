import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import SplashScreen from './SplashScreen.vue';

vi.mock('gsap', () => ({
    gsap: {
        fromTo: vi.fn(),
        to: vi.fn(),
        killTweensOf: vi.fn(),
    },
}));

describe('SplashScreen', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should not show start button initially', () => {
        const wrapper = shallowMount(SplashScreen);

        expect(wrapper.find('.start-btn').exists()).toBe(false);
    });

    it('should show start button after delay', async () => {
        const wrapper = shallowMount(SplashScreen);

        vi.advanceTimersByTime(5700);
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.start-btn').exists()).toBe(true);
    });

    it('should emit animation-complete after 5500ms', () => {
        const wrapper = shallowMount(SplashScreen);

        vi.advanceTimersByTime(5500);

        expect(wrapper.emitted('animation-complete')).toHaveLength(1);
    });

    it('should emit start when start button is clicked', async () => {
        const wrapper = shallowMount(SplashScreen);

        vi.advanceTimersByTime(5700);
        await wrapper.vm.$nextTick();

        await wrapper.find('.start-btn').trigger('click');

        expect(wrapper.emitted('start')).toHaveLength(1);
    });

    it('should render the Acronym component with YAAG letters', () => {
        const wrapper = shallowMount(SplashScreen);
        const acronym = wrapper.findComponent({ name: 'Acronym' });

        expect(acronym.exists()).toBe(true);
        expect(acronym.props('letterArray')).toEqual(['Y', 'A', 'A', 'G']);
    });

    it('should show AnimatedTypingComponent after 2300ms', async () => {
        const wrapper = shallowMount(SplashScreen);

        expect(wrapper.findComponent({ name: 'AnimatedTypingComponent' }).exists()).toBe(false);

        vi.advanceTimersByTime(2300);
        await wrapper.vm.$nextTick();

        const typing = wrapper.findComponent({ name: 'AnimatedTypingComponent' });
        expect(typing.exists()).toBe(true);
        expect(typing.props('text')).toBe('Yet Another Acronym Game');
    });
});
