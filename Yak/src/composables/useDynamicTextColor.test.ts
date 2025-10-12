import { ref } from 'vue';
import { describe, it, expect } from 'vitest';
import { useDynamicTextColor } from './useDynamicTextColor';

describe('useDynamicTextColor', () => {
  it('should return "black" for light background colors (hex)', () => {
    const backgroundColor = ref('#FFFFFF'); // White
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('black');

    backgroundColor.value = '#F0F0F0'; // Light gray
    expect(textColor.value).toBe('black');

    backgroundColor.value = '#FF00FF'; // Magenta (bright)
    expect(textColor.value).toBe('black');
  });

  it('should return "white" for dark background colors (hex)', () => {
    const backgroundColor = ref('#000000'); // Black
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('white');

    backgroundColor.value = '#333333'; // Dark gray
    expect(textColor.value).toBe('white');

    backgroundColor.value = '#800080'; // Purple (dark)
    expect(textColor.value).toBe('white');
  });

  it('should return "black" for light background colors (rgb)', () => {
    const backgroundColor = ref('rgb(255, 255, 255)'); // White
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('black');

    backgroundColor.value = 'rgb(240, 240, 240)'; // Light gray
    expect(textColor.value).toBe('black');

    backgroundColor.value = 'rgb(255, 0, 255)'; // Magenta (bright)
    expect(textColor.value).toBe('black');
  });

  it('should return "white" for dark background colors (rgb)', () => {
    const backgroundColor = ref('rgb(0, 0, 0)'); // Black
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('white');

    backgroundColor.value = 'rgb(51, 51, 51)'; // Dark gray
    expect(textColor.value).toBe('white');

    backgroundColor.value = 'rgb(128, 0, 128)'; // Purple (dark)
    expect(textColor.value).toBe('white');
  });

  it('should return "black" for light background colors (rgba)', () => {
    const backgroundColor = ref('rgba(255, 255, 255, 1)'); // White
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('black');

    backgroundColor.value = 'rgba(240, 240, 240, 0.5)'; // Light gray with transparency
    expect(textColor.value).toBe('black');
  });

  it('should return "white" for dark background colors (rgba)', () => {
    const backgroundColor = ref('rgba(0, 0, 0, 1)'); // Black
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('white');

    backgroundColor.value = 'rgba(51, 51, 51, 0.7)'; // Dark gray with transparency
    expect(textColor.value).toBe('white');
  });

  it('should handle immediate evaluation', () => {
    const backgroundColor = ref('#00FF00'); // Green (bright)
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('black');
  });

  it('should react to background color changes', async () => {
    const backgroundColor = ref('#000000');
    const textColor = useDynamicTextColor(backgroundColor);
    expect(textColor.value).toBe('white');

    backgroundColor.value = '#FFFFFF';
    // Await next tick for watch effect to run
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(textColor.value).toBe('black');
  });
});
