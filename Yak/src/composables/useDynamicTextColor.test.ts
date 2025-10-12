import { ref } from 'vue';
import { describe, it, expect } from 'vitest';
import { useDynamicTextColor } from './useDynamicTextColor';

describe('useDynamicTextColor', () => {
  it('should return "black" for light background colors (hex)', () => {
    const backgroundColor = ref('#FFFFFF');
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('black');

    backgroundColor.value = '#F0F0F0';
    expect(textColor.value).toBe('black');

    backgroundColor.value = '#FF00FF';
    expect(textColor.value).toBe('black');
  });

  it('should return "white" for dark background colors (hex)', () => {
    const backgroundColor = ref('#000000');
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('white');

    backgroundColor.value = '#333333';
    expect(textColor.value).toBe('white');

    backgroundColor.value = '#800080';
    expect(textColor.value).toBe('white');
  });

  it('should return "black" for light background colors (rgb)', () => {
    const backgroundColor = ref('rgb(255, 255, 255)');
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('black');

    backgroundColor.value = 'rgb(240, 240, 240)';
    expect(textColor.value).toBe('black');

    backgroundColor.value = 'rgb(255, 0, 255)';
    expect(textColor.value).toBe('black');
  });

  it('should return "white" for dark background colors (rgb)', () => {
    const backgroundColor = ref('rgb(0, 0, 0)');
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('white');

    backgroundColor.value = 'rgb(51, 51, 51)';
    expect(textColor.value).toBe('white');

    backgroundColor.value = 'rgb(128, 0, 128)';
    expect(textColor.value).toBe('white');
  });

  it('should return "black" for light background colors (rgba)', () => {
    const backgroundColor = ref('rgba(255, 255, 255, 1)');
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('black');

    backgroundColor.value = 'rgba(240, 240, 240, 0.5)';
    expect(textColor.value).toBe('black');
  });

  it('should return "white" for dark background colors (rgba)', () => {
    const backgroundColor = ref('rgba(0, 0, 0, 1)');
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('white');

    backgroundColor.value = 'rgba(51, 51, 51, 0.7)';
    expect(textColor.value).toBe('white');
  });

  it('should handle immediate evaluation', () => {
    const backgroundColor = ref('#00FF00');
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('black');
  });

  it('should react to background color changes', async () => {
    const backgroundColor = ref('#000000');
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('white');

    backgroundColor.value = '#FFFFFF';

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(textColor.value).toBe('black');
  });

  [
    ref('hsl(120, 100%, 50%)'),
    ref('#GGGGGG'),
    ref('rgba(r, g, b, a)')
  ].forEach(color => {
    it(`should default to "white" for unrecognized color format: ${color.value}`, () => {
      const backgroundColor = color;
      const textColor = useDynamicTextColor(backgroundColor);
      expect(textColor.value).toBe('white');
    });
  });

  [{ input: ref('#FFF'), expected: 'black' }, { input: ref('#000'), expected: 'white' }].forEach(({ input, expected }) => {
    it('should handle short hex format', () => {
      const backgroundColor = input;
      const textColor = useDynamicTextColor(backgroundColor);
      expect(textColor.value).toBe(expected);
    });
  })

  it('should watch for changes in background color and update text color accordingly', async () => {
    const backgroundColor = ref('#123456');
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('white');

    backgroundColor.value = '#EEEEEE';
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(textColor.value).toBe('black');

    backgroundColor.value = 'rgb(10, 10, 10)';
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(textColor.value).toBe('white');
  })
});
