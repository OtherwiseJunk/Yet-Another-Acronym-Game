import { describe, it, expect } from "vitest";
import { Color } from "./color";

describe("Color", () => {
  it("should store main color and shades", () => {
    const shades = ["#FF3300", "#FF6600", "#FF9900", "#FFCC00"];
    const color = new Color("#FF0000", shades);

    expect(color.main).toBe("#FF0000");
    expect(color.shades).toEqual(shades);
  });

  it("should allow empty shades array", () => {
    const color = new Color("#000000", []);

    expect(color.main).toBe("#000000");
    expect(color.shades).toEqual([]);
  });
});
