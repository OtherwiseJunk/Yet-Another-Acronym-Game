import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import VotingScreen from "./VotingScreen.vue";
import { UserSubmission, UserData } from "../models";

vi.mock("../stores/discordStore", () => ({
  useDiscordStore: vi.fn(() => ({
    auth: { access_token: "test", user: { id: "voter-id" } },
    currentUserData: new UserData("avatar", "decoration", "Voter"),
  })),
}));

function createSubmissions() {
  return {
    "user-1": new UserSubmission("Some Answer Here", 5, new UserData("avatar1.png", "", "Player1")),
    "user-2": new UserSubmission(
      "Another Answer Here",
      8,
      new UserData("avatar2.png", "", "Player2"),
    ),
  };
}

describe("VotingScreen - rendering", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("should render a voting card for each submission", () => {
    const wrapper = shallowMount(VotingScreen, {
      props: {
        submissionsByUserId: createSubmissions(),
        resultsMode: false,
        skipVoting: false,
        timeRemaining: 20,
        acronym: "YAAG",
        colorPallette: [],
      },
    });

    const cards = wrapper.findAll(".voting-card");
    expect(cards).toHaveLength(2);
  });

  it("should display submission text on each card", () => {
    const wrapper = shallowMount(VotingScreen, {
      props: {
        submissionsByUserId: createSubmissions(),
        resultsMode: false,
        skipVoting: false,
        timeRemaining: 20,
        acronym: "YAAG",
        colorPallette: [],
      },
    });

    const texts = wrapper.findAll(".submission-text").map((el) => el.text());
    expect(texts).toContain("Some Answer Here");
    expect(texts).toContain("Another Answer Here");
  });

  it("should sort submissions by answer time (fastest first)", () => {
    const submissions = {
      "slow-user": new UserSubmission("Slow Answer", 30, new UserData("", "", "SlowPlayer")),
      "fast-user": new UserSubmission("Fast Answer", 3, new UserData("", "", "FastPlayer")),
      "mid-user": new UserSubmission("Mid Answer", 15, new UserData("", "", "MidPlayer")),
    };

    const wrapper = shallowMount(VotingScreen, {
      props: {
        submissionsByUserId: submissions,
        resultsMode: false,
        skipVoting: false,
        timeRemaining: 20,
        acronym: "YAAG",
        colorPallette: [],
      },
    });

    const times = wrapper.findAll(".time").map((el) => el.text());
    expect(times[0]).toBe("3 s");
    expect(times[1]).toBe("15 s");
    expect(times[2]).toBe("30 s");
  });

  it('should show "Vote" header with time remaining in voting mode', () => {
    const wrapper = shallowMount(VotingScreen, {
      props: {
        submissionsByUserId: createSubmissions(),
        resultsMode: false,
        skipVoting: false,
        timeRemaining: 15,
        acronym: "YAAG",
        colorPallette: [],
      },
    });

    expect(wrapper.find(".header-text").text()).toBe("Vote - 15");
  });

  it('should show "Results" header in results mode', () => {
    const wrapper = shallowMount(VotingScreen, {
      props: {
        submissionsByUserId: createSubmissions(),
        resultsMode: true,
        skipVoting: false,
        timeRemaining: 0,
        acronym: "YAAG",
        colorPallette: [],
      },
    });

    expect(wrapper.find(".header-text").text()).toBe("Results");
  });

  it("should show skip voting message when not enough players", () => {
    const wrapper = shallowMount(VotingScreen, {
      props: {
        submissionsByUserId: createSubmissions(),
        resultsMode: false,
        skipVoting: true,
        timeRemaining: 20,
        acronym: "YAAG",
        colorPallette: [],
      },
    });

    expect(wrapper.find(".header-subtext").text()).toContain("aren't enough players");
  });

  it("should show Next Round button in results mode", () => {
    const wrapper = shallowMount(VotingScreen, {
      props: {
        submissionsByUserId: createSubmissions(),
        resultsMode: true,
        skipVoting: false,
        timeRemaining: 0,
        acronym: "YAAG",
        colorPallette: [],
      },
    });

    expect(wrapper.find(".next-round-button").exists()).toBe(true);
  });

  it("should emit next-round when Next Round button is clicked", async () => {
    const wrapper = shallowMount(VotingScreen, {
      props: {
        submissionsByUserId: createSubmissions(),
        resultsMode: true,
        skipVoting: false,
        timeRemaining: 0,
        acronym: "YAAG",
        colorPallette: [],
      },
    });

    await wrapper.find(".next-round-button").trigger("click");
    expect(wrapper.emitted("next-round")).toBeDefined();
  });

  it("should render with empty submissions without crashing", () => {
    const wrapper = shallowMount(VotingScreen, {
      props: {
        submissionsByUserId: {},
        resultsMode: false,
        skipVoting: false,
        timeRemaining: 20,
        acronym: "YAAG",
        colorPallette: [],
      },
    });

    expect(wrapper.findAll(".voting-card")).toHaveLength(0);
  });

  describe("results-mode scoring breakdown", () => {
    const submissions = () => ({
      "user-1": new UserSubmission("Fast Answer", 3, new UserData("", "", "FastPlayer")),
      "user-2": new UserSubmission("Mid Answer", 10, new UserData("", "", "MidPlayer")),
      "user-3": new UserSubmission("Slow Answer", 20, new UserData("", "", "SlowPlayer")),
    });

    const scoring = {
      "user-1": {
        votes_received: 1,
        voted_for_winner: 0,
        speed_bonus: 1,
        total: 2,
        is_winner: false,
      },
      "user-2": {
        votes_received: 2,
        voted_for_winner: 0,
        speed_bonus: 0,
        total: 2,
        is_winner: true,
      },
      "user-3": {
        votes_received: 0,
        voted_for_winner: 1,
        speed_bonus: 0,
        total: 1,
        is_winner: false,
      },
    };

    it("marks only the fastest-with-votes card with .speed-bonus-card", () => {
      const wrapper = shallowMount(VotingScreen, {
        props: {
          submissionsByUserId: submissions(),
          resultsMode: true,
          skipVoting: false,
          timeRemaining: 0,
          acronym: "YAAG",
          colorPallette: [],
          lastRoundScoring: scoring,
          lastRoundWinnerId: "user-2",
        },
      });

      const flameCards = wrapper.findAll(".speed-bonus-card");
      expect(flameCards).toHaveLength(1);
      expect(flameCards[0].attributes("id")).toBe("user-1");
    });

    it("marks only the winner card with .winner-card", () => {
      const wrapper = shallowMount(VotingScreen, {
        props: {
          submissionsByUserId: submissions(),
          resultsMode: true,
          skipVoting: false,
          timeRemaining: 0,
          acronym: "YAAG",
          colorPallette: [],
          lastRoundScoring: scoring,
          lastRoundWinnerId: "user-2",
        },
      });

      const winnerCards = wrapper.findAll(".winner-card");
      expect(winnerCards).toHaveLength(1);
      expect(winnerCards[0].attributes("id")).toBe("user-2");
    });

    it("does NOT apply .speed-bonus-card outside results mode", () => {
      const wrapper = shallowMount(VotingScreen, {
        props: {
          submissionsByUserId: submissions(),
          resultsMode: false,
          skipVoting: false,
          timeRemaining: 20,
          acronym: "YAAG",
          colorPallette: [],
          lastRoundScoring: scoring,
          lastRoundWinnerId: "user-2",
        },
      });

      expect(wrapper.findAll(".speed-bonus-card")).toHaveLength(0);
    });

    it("shows the winner-voter banner when viewer voted for the winner", () => {
      const wrapper = shallowMount(VotingScreen, {
        props: {
          submissionsByUserId: submissions(),
          resultsMode: true,
          skipVoting: false,
          timeRemaining: 0,
          acronym: "YAAG",
          colorPallette: [],
          lastRoundScoring: scoring,
          lastRoundWinnerId: "user-2",
          votes: { "voter-id": "user-2" }, // mocked discord user id
        },
      });

      expect(wrapper.find(".winner-voter-banner").exists()).toBe(true);
    });

    it("hides the winner-voter banner when viewer voted for a non-winner", () => {
      const wrapper = shallowMount(VotingScreen, {
        props: {
          submissionsByUserId: submissions(),
          resultsMode: true,
          skipVoting: false,
          timeRemaining: 0,
          acronym: "YAAG",
          colorPallette: [],
          lastRoundScoring: scoring,
          lastRoundWinnerId: "user-2",
          votes: { "voter-id": "user-1" },
        },
      });

      expect(wrapper.find(".winner-voter-banner").exists()).toBe(false);
    });
  });
});
