import { setActivePinia, createPinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { usePalletteStore } from "./palletteStore";

describe('palletteStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    });

    it('should initialize with default values', () => {
        const store = usePalletteStore();
        expect(store.acronymPallette).toEqual([]);
    });

    it('should set acronym pallette based on acronym', () => {
        const store = usePalletteStore();
        store.setAcronymPallette("TEST");
        expect(store.acronymPallette.length).toBe(4);
        const firstPallette = [...store.acronymPallette];
        store.setAcronymPallette("TEST");
        expect(store.acronymPallette).toEqual(firstPallette); // Should not change if same acronym
        store.setAcronymPallette("NEW");
        expect(store.acronymPallette.length).toBe(3);
        expect(store.acronymPallette).not.toEqual(firstPallette); // Should change if different acronym
    });

    [
        { input: '#FFFFFF', expected: 'rgba(255, 255, 255, 0.5)' },
        { input: '#000000', expected: 'rgba(0, 0, 0, 0.5)' },
        { input: '#FF0000', expected: 'rgba(255, 0, 0, 0.5)' },
        { input: '#00FF00', expected: 'rgba(0, 255, 0, 0.5)' },
        { input: '#0000FF', expected: 'rgba(0, 0, 255, 0.5)' },
    ].forEach(({ input, expected }) => {
        it(`should convert hex ${input} to RGB with alpha`, () => {
            const store = usePalletteStore();
            const rgb = store.hexToRGB(input, 0.5);
            expect(rgb).toBe(expected);
        })
    });

    [
        { input: '#FFFFFF', expected: 'rgb(255, 255, 255)' },
        { input: '#000000', expected: 'rgb(0, 0, 0)' },
        { input: '#FF0000', expected: 'rgb(255, 0, 0)' },
        { input: '#00FF00', expected: 'rgb(0, 255, 0)' },
        { input: '#0000FF', expected: 'rgb(0, 0, 255)' },
    ].forEach(({ input, expected }) => {
        it(`should convert hex ${input} to RGB without alpha`, () => {
            const store = usePalletteStore();
            const rgb = store.hexToRGB(input, 0);
            expect(rgb).toBe(expected);
        })
    });
});