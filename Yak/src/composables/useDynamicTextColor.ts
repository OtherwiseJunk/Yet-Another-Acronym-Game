import { ref, watch, type Ref } from "vue";

// Function to convert hex to RGB
function hexToRgb(hex: string): [number, number, number] | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (_, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
}

// Function to convert rgba to RGB (ignoring alpha for luminance)
function rgbaToRgb(rgba: string): [number, number, number] | null {
  const parts = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
  return parts ? [parseInt(parts[1], 10), parseInt(parts[2], 10), parseInt(parts[3], 10)] : null;
}

// Calculate luminance (0-1)
function getLuminance(r: number, g: number, b: number): number {
  // For sRGB, first linearize the RGB values
  const linearize = (c: number) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const R = linearize(r);
  const G = linearize(g);
  const B = linearize(b);

  // ITU-R BT.709 standard for luminance
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function useDynamicTextColor(backgroundColor: Ref<string>): Ref<"white" | "black"> {
  const textColor = ref<"white" | "black">("white"); // Default to white

  watch(
    backgroundColor,
    (newColor) => {
      let r = 0,
        g = 0,
        b = 0;

      if (newColor.startsWith("#")) {
        const rgb = hexToRgb(newColor);
        if (rgb) [r, g, b] = rgb;
      } else if (newColor.startsWith("rgb")) {
        const rgb = rgbaToRgb(newColor);
        if (rgb) [r, g, b] = rgb;
      }
      // Add more color format parsers if needed (e.g., named colors)

      const luminance = getLuminance(r, g, b);

      // A common threshold is 0.5, but 0.179 is also used for better contrast
      textColor.value = luminance > 0.179 ? "black" : "white";
    },
    { immediate: true },
  );

  return textColor;
}
