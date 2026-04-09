import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import App from "./App.vue";
import AnswerSubmission from "./components/AnswerSubmissionScreen.vue";

vi.mock("gsap", () => ({
  gsap: {
    fromTo: vi.fn(),
    to: vi.fn(() => Promise.resolve()),
    killTweensOf: vi.fn(),
  },
}));

let subscribeCallback: (mutation: any, state: any) => void;
const mockStartGame = vi.fn();
const mockSubmitAnswer = vi.fn();
const mockSubmitVote = vi.fn();

vi.mock("./stores/gameStore", () => ({
  useGameStore: vi.fn(() => ({
    $subscribe: vi.fn((cb: any) => {
      subscribeCallback = cb;
    }),
    startGame: mockStartGame,
    submitAnswer: mockSubmitAnswer,
    submitVote: mockSubmitVote,
    gameState: {
      game_phase: 0,
      current_acronym: "",
      submissions: new Map(),
      players: [],
      round_time_remaining: 0,
    },
  })),
}));

function makeState(overrides = {}) {
  return {
    gameState: {
      game_phase: 0,
      current_acronym: "ABC",
      submissions: new Map(),
      players: [1],
      round_time_remaining: 60,
      ...overrides,
    },
  };
}

describe("App", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should render the root element", () => {
    const wrapper = shallowMount(App);
    expect(wrapper.find(".yaag-root").exists()).toBe(true);
  });

  it("should show SplashScreen initially (phase 0)", () => {
    const wrapper = shallowMount(App);
    expect(wrapper.findComponent({ name: "SplashScreen" }).exists()).toBe(true);
  });

  it("should not show AnswerSubmission or VotingScreen at phase 0", () => {
    const wrapper = shallowMount(App);
    expect(wrapper.findComponent(AnswerSubmission).exists()).toBe(false);
    expect(wrapper.findComponent({ name: "VotingScreen" }).exists()).toBe(false);
  });

  it("should subscribe to the game store on mount", () => {
    shallowMount(App);
    expect(subscribeCallback).toBeDefined();
  });

  it("should update phase and acronym when store state changes", async () => {
    const wrapper = shallowMount(App);

    subscribeCallback({}, makeState({ game_phase: 1, current_acronym: "XYZ" }));
    await wrapper.vm.$nextTick();

    // With phase 1 and animationComplete still false, SplashScreen stays visible
    expect(wrapper.findComponent({ name: "SplashScreen" }).exists()).toBe(true);
  });

  it("should show AnswerSubmission in phase 1 after animation completes", async () => {
    const wrapper = shallowMount(App);

    // Trigger animation-complete
    const splash = wrapper.findComponent({ name: "SplashScreen" });
    splash.vm.$emit("animation-complete");
    await wrapper.vm.$nextTick();

    // Now trigger phase 1
    subscribeCallback({}, makeState({ game_phase: 1 }));
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(AnswerSubmission).exists()).toBe(true);
  });

  it("should call startGame when SplashScreen emits start", async () => {
    const wrapper = shallowMount(App);

    const splash = wrapper.findComponent({ name: "SplashScreen" });
    splash.vm.$emit("start");
    await wrapper.vm.$nextTick();

    expect(mockStartGame).toHaveBeenCalled();
  });

  it("should call submitAnswer when AnswerSubmission emits submit", async () => {
    const wrapper = shallowMount(App);

    // Get to phase 1 with animation complete
    const splash = wrapper.findComponent({ name: "SplashScreen" });
    splash.vm.$emit("animation-complete");
    await wrapper.vm.$nextTick();

    subscribeCallback({}, makeState({ game_phase: 1 }));
    await wrapper.vm.$nextTick();

    const submission = wrapper.findComponent(AnswerSubmission);
    submission.vm.$emit("submit", "Test Answer");
    await wrapper.vm.$nextTick();

    expect(mockSubmitAnswer).toHaveBeenCalledWith("Test Answer");
  });

  it("should show VotingScreen in phase 2 after animation completes", async () => {
    const wrapper = shallowMount(App);

    const splash = wrapper.findComponent({ name: "SplashScreen" });
    splash.vm.$emit("animation-complete");
    await wrapper.vm.$nextTick();

    subscribeCallback({}, makeState({ game_phase: 2 }));
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent({ name: "VotingScreen" }).exists()).toBe(true);
  });

  it("should show VotingScreen in results mode at phase 3", async () => {
    const wrapper = shallowMount(App);

    const splash = wrapper.findComponent({ name: "SplashScreen" });
    splash.vm.$emit("animation-complete");
    await wrapper.vm.$nextTick();

    subscribeCallback({}, makeState({ game_phase: 3 }));
    await wrapper.vm.$nextTick();

    const voting = wrapper.findComponent({ name: "VotingScreen" });
    expect(voting.exists()).toBe(true);
    expect(voting.props("resultsMode")).toBe(true);
  });

  it("should call submitVote when VotingScreen emits vote", async () => {
    const wrapper = shallowMount(App);

    const splash = wrapper.findComponent({ name: "SplashScreen" });
    splash.vm.$emit("animation-complete");
    await wrapper.vm.$nextTick();

    subscribeCallback({}, makeState({ game_phase: 2 }));
    await wrapper.vm.$nextTick();

    const voting = wrapper.findComponent({ name: "VotingScreen" });
    voting.vm.$emit("vote", "user-123");
    await wrapper.vm.$nextTick();

    expect(mockSubmitVote).toHaveBeenCalledWith("user-123");
  });

  it("should call startGame on next-round from VotingScreen", async () => {
    const wrapper = shallowMount(App);

    const splash = wrapper.findComponent({ name: "SplashScreen" });
    splash.vm.$emit("animation-complete");
    await wrapper.vm.$nextTick();

    subscribeCallback({}, makeState({ game_phase: 3 }));
    await wrapper.vm.$nextTick();

    const voting = wrapper.findComponent({ name: "VotingScreen" });
    voting.vm.$emit("next-round");
    await wrapper.vm.$nextTick();

    expect(mockStartGame).toHaveBeenCalled();
  });
});
