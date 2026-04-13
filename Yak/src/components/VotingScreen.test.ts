import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import VotingScreen from "./VotingScreen.vue";
import { UserSubmission, UserData } from "../models";
import { readFileSync } from "fs";
import { join } from "path";

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

describe("VotingScreen", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Suppress the unhandled error from vote() calling getElementById in jsdom
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  describe("props.value double-unwrap bug", () => {
    it("should not emit a vote event when in results mode", async () => {
      const wrapper = shallowMount(VotingScreen, {
        props: {
          submissionsByUserId: createSubmissions(),
          resultsMode: true,
          skipVoting: false,
          timeRemaining: 20,
          acronym: "YAAG",
          colorPallette: [],
        },
        global: {
          config: {
            errorHandler: () => {},
          },
        },
      });

      const cards = wrapper.findAll(".voting-card");
      if (cards.length > 0) {
        try {
          await cards[0].trigger("click");
        } catch {}
      }
      expect(wrapper.emitted("vote")).toBeUndefined();
    });
  });

  describe("XSS via innerHTML", () => {
    it("should use textContent instead of innerHTML for user submissions", () => {
      const source = readFileSync(join(process.cwd(), "src/components/VotingScreen.vue"), "utf-8");

      expect(source).not.toMatch(/\.innerHTML\s*=/);
    });
  });
});
