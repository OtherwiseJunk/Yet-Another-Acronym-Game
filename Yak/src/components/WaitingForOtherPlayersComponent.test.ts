import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import WaitingForOtherPlayersComponent from "./WaitingForOtherPlayersComponent.vue";

describe("WaitingForOtherPlayersComponent", () => {
  it("should display the waiting message", () => {
    const wrapper = shallowMount(WaitingForOtherPlayersComponent, {
      props: { submissionText: "My Answer" },
    });

    expect(wrapper.text()).toContain("Submitted! Waiting for other players...");
  });

  it("should display the submission text", () => {
    const wrapper = shallowMount(WaitingForOtherPlayersComponent, {
      props: { submissionText: "Fancy Llama Answers Grandly" },
    });

    expect(wrapper.text()).toContain("Fancy Llama Answers Grandly");
  });

  it("should handle empty submission text", () => {
    const wrapper = shallowMount(WaitingForOtherPlayersComponent, {
      props: { submissionText: "" },
    });

    expect(wrapper.text()).toContain("Submitted! Waiting for other players...");
  });

  it("should render submitted-count fraction when totalPlayers > 0", () => {
    const wrapper = shallowMount(WaitingForOtherPlayersComponent, {
      props: {
        submissionText: "My Answer",
        submittedCount: 2,
        totalPlayers: 4,
        timeRemaining: 17,
      },
    });

    expect(wrapper.text()).toContain("2/4 submitted");
  });

  it("should render countdown when timeRemaining > 0", () => {
    const wrapper = shallowMount(WaitingForOtherPlayersComponent, {
      props: {
        submissionText: "My Answer",
        submittedCount: 1,
        totalPlayers: 3,
        timeRemaining: 8,
      },
    });

    expect(wrapper.text()).toContain("8s");
  });

  it("should hide progress when totalPlayers is 0 (backwards compat)", () => {
    const wrapper = shallowMount(WaitingForOtherPlayersComponent, {
      props: { submissionText: "My Answer" },
    });

    expect(wrapper.text()).not.toContain("submitted");
  });
});
