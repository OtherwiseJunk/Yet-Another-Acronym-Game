import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import AnimatedTypingComponent from './AnimatedTypingComponent.vue';

describe('AnimatedTypingComponent', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should start with empty displayed text', () => {
        const wrapper = shallowMount(AnimatedTypingComponent, {
            props: { text: 'Hello' },
        });

        // Before any interval fires, displayedText is empty
        // (the watch fires immediately but the first interval hasn't ticked yet)
        expect(wrapper.find('p').text()).toBe('');
    });

    it('should type text character by character', async () => {
        const wrapper = shallowMount(AnimatedTypingComponent, {
            props: { text: 'Hi' },
        });

        vi.advanceTimersByTime(80);
        await wrapper.vm.$nextTick();
        expect(wrapper.find('p').text()).toBe('H');

        vi.advanceTimersByTime(80);
        await wrapper.vm.$nextTick();
        expect(wrapper.find('p').text()).toBe('Hi');
    });

    it('should have typing-cursor class while typing', () => {
        const wrapper = shallowMount(AnimatedTypingComponent, {
            props: { text: 'Hello' },
        });

        expect(wrapper.find('p').classes()).toContain('typing-cursor');
    });

    it('should switch to blinking-out-cursor after typing completes', async () => {
        const wrapper = shallowMount(AnimatedTypingComponent, {
            props: { text: 'AB' },
        });

        // Type both characters plus one more tick to trigger the "else" branch
        vi.advanceTimersByTime(80 * 3);
        await wrapper.vm.$nextTick();

        expect(wrapper.find('p').classes()).toContain('blinking-out-cursor');
    });

    it('should handle empty text by showing typing cursor', () => {
        const wrapper = shallowMount(AnimatedTypingComponent, {
            props: { text: '' },
        });

        expect(wrapper.find('p').classes()).toContain('typing-cursor');
        expect(wrapper.find('p').text()).toBe('');
    });

    it('should restart animation when text prop changes', async () => {
        const wrapper = shallowMount(AnimatedTypingComponent, {
            props: { text: 'AB' },
        });

        // Type out first text
        vi.advanceTimersByTime(80 * 3);
        await wrapper.vm.$nextTick();
        expect(wrapper.find('p').text()).toBe('AB');

        // Change text prop
        await wrapper.setProps({ text: 'XY' });

        // Should reset
        expect(wrapper.find('p').text()).toBe('');
        expect(wrapper.find('p').classes()).toContain('typing-cursor');

        // Type new text
        vi.advanceTimersByTime(80);
        await wrapper.vm.$nextTick();
        expect(wrapper.find('p').text()).toBe('X');

        vi.advanceTimersByTime(80);
        await wrapper.vm.$nextTick();
        expect(wrapper.find('p').text()).toBe('XY');
    });
});
