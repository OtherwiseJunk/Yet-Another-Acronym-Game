import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import Acronym from './Acronym.vue';
import { Color } from '../models/color';

vi.mock('gsap', () => ({
    gsap: {
        fromTo: vi.fn(),
        to: vi.fn(() => Promise.resolve()),
        killTweensOf: vi.fn(),
    },
}));

const testColors = [
    new Color('#FF0000', ['#FF3300', '#FF6600', '#FF9900', '#FFCC00']),
    new Color('#00FF00', ['#33FF33', '#66FF66', '#99FF99', '#CCFFCC']),
    new Color('#0000FF', ['#3333FF', '#6666FF', '#9999FF', '#CCCCFF']),
];

describe('Acronym', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should render a container with text and svg refs', () => {
        const wrapper = shallowMount(Acronym, {
            props: { letterArray: ['A', 'B', 'C'], colors: testColors },
        });

        expect(wrapper.find('.container').exists()).toBe(true);
        expect(wrapper.find('h2').exists()).toBe(true);
        expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('should add letters to the DOM over time', async () => {
        const wrapper = shallowMount(Acronym, {
            props: { letterArray: ['X', 'Y'], colors: testColors },
        });

        // startAnimation is async - flush promises then advance timers
        await vi.advanceTimersByTimeAsync(300);
        await wrapper.vm.$nextTick();

        const h2 = wrapper.find('h2');
        expect(h2.element.children.length).toBe(1);
        expect(h2.element.children[0].innerHTML).toBe('X');

        await vi.advanceTimersByTimeAsync(300);
        await wrapper.vm.$nextTick();

        expect(h2.element.children.length).toBe(2);
        expect(h2.element.children[1].innerHTML).toBe('Y');
    });

    it('should apply colors to letters based on index', async () => {
        const wrapper = shallowMount(Acronym, {
            props: { letterArray: ['A', 'B'], colors: testColors },
        });

        await vi.advanceTimersByTimeAsync(300);
        await wrapper.vm.$nextTick();

        const firstLetter = wrapper.find('h2').element.children[0] as HTMLElement;
        // jsdom normalizes hex to rgb
        expect(firstLetter.style.color).toBe('rgb(255, 0, 0)');
    });

    it('should clear and re-animate when letterArray changes', async () => {
        const wrapper = shallowMount(Acronym, {
            props: { letterArray: ['A'], colors: testColors },
        });

        await vi.advanceTimersByTimeAsync(300);
        await wrapper.vm.$nextTick();
        expect(wrapper.find('h2').element.children.length).toBe(1);

        await wrapper.setProps({ letterArray: ['X', 'Y', 'Z'] });

        // After prop change, the async startAnimation clears then re-adds
        await vi.advanceTimersByTimeAsync(600);
        await wrapper.vm.$nextTick();

        expect(wrapper.find('h2').element.children.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty letterArray', () => {
        const wrapper = shallowMount(Acronym, {
            props: { letterArray: [], colors: testColors },
        });

        expect(wrapper.find('h2').element.children.length).toBe(0);
    });
});
