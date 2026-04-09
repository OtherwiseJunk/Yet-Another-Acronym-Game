import { describe, it, expect } from "vitest";
import { UserData } from "./userData";

describe("UserData", () => {
  it("should store avatar URL, decoration URL, and display name", () => {
    const userData = new UserData(
      "https://cdn.example.com/avatar.png",
      "https://cdn.example.com/deco.png",
      "PlayerOne",
    );

    expect(userData.avatarUrl).toBe("https://cdn.example.com/avatar.png");
    expect(userData.decorationUrl).toBe("https://cdn.example.com/deco.png");
    expect(userData.displayName).toBe("PlayerOne");
  });

  it("should allow empty strings", () => {
    const userData = new UserData("", "", "");

    expect(userData.avatarUrl).toBe("");
    expect(userData.decorationUrl).toBe("");
    expect(userData.displayName).toBe("");
  });
});
