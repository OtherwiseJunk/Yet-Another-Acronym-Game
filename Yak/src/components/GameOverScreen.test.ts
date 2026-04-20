import { describe, it, expect, beforeEach, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import GameOverScreen from "./GameOverScreen.vue";
import { UserSubmission, UserData } from "../models";

function makeSubmission(name: string) {
  return new UserSubmission("answer", 5, new UserData("", "", name));
}

describe("GameOverScreen", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("puts the top-scoring player as the first leaderboard DOM child (1st place on top)", () => {
    const wrapper = shallowMount(GameOverScreen, {
      props: {
        players: ["low", "top", "mid"],
        scores: { low: 2, top: 10, mid: 5 },
        submissions: {
          low: makeSubmission("LowPlayer"),
          top: makeSubmission("TopPlayer"),
          mid: makeSubmission("MidPlayer"),
        },
        playerData: {},
      },
    });

    const entries = wrapper.findAll(".leaderboard-entry");
    expect(entries).toHaveLength(3);
    expect(entries[0].text()).toContain("TopPlayer");
    expect(entries[2].text()).toContain("LowPlayer");
  });

  it("renders the fastest-overall badge for every id in overallFastestPlayerIds", () => {
    const wrapper = shallowMount(GameOverScreen, {
      props: {
        players: ["a", "b", "c"],
        scores: { a: 5, b: 5, c: 3 },
        submissions: {
          a: makeSubmission("Ada"),
          b: makeSubmission("Bea"),
          c: makeSubmission("Cee"),
        },
        playerData: {},
        cumulativeTimes: { a: 30, b: 30, c: 50 },
        overallFastestPlayerIds: ["a", "b"],
      },
    });

    const badges = wrapper.findAll(".fastest-overall-badge");
    expect(badges).toHaveLength(2);
    const parents = badges.map((b) => b.element.parentElement?.parentElement?.textContent || "");
    expect(parents.some((t) => t.includes("Ada"))).toBe(true);
    expect(parents.some((t) => t.includes("Bea"))).toBe(true);
  });

  it("shows cumulative time under each player name when provided", () => {
    const wrapper = shallowMount(GameOverScreen, {
      props: {
        players: ["a"],
        scores: { a: 5 },
        submissions: { a: makeSubmission("Ada") },
        playerData: {},
        cumulativeTimes: { a: 42.3 },
        overallFastestPlayerIds: [],
      },
    });

    expect(wrapper.text()).toContain("42.3s total");
  });

  it("omits cumulative time row when none was provided for a player", () => {
    const wrapper = shallowMount(GameOverScreen, {
      props: {
        players: ["a"],
        scores: { a: 3 },
        submissions: { a: makeSubmission("Ada") },
        playerData: {},
        cumulativeTimes: {},
        overallFastestPlayerIds: [],
      },
    });

    expect(wrapper.find(".cumulative-time").exists()).toBe(false);
  });
});
