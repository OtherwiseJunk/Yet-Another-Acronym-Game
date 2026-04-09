import { describe, it, expect } from "vitest";
import { GameState, GamePhases } from "./gameState";
import { UserSubmission } from "./userSubmission";
import { UserData } from "./userData";

describe("GameState", () => {
  it("should store all game state properties", () => {
    const scores: Record<string, number> = { "1": 10, "2": 5 };
    const submissions: Record<string, UserSubmission> = {
      "1": new UserSubmission("Answer", 5, new UserData("", "", "Player")),
    };

    const state = new GameState(
      GamePhases.SUBMITTING,
      3,
      "ABC",
      scores,
      ["1", "2"],
      45,
      submissions,
    );

    expect(state.game_phase).toBe(GamePhases.SUBMITTING);
    expect(state.round_number).toBe(3);
    expect(state.current_acronym).toBe("ABC");
    expect(state.scores).toBe(scores);
    expect(state.players).toEqual(["1", "2"]);
    expect(state.round_time_remaining).toBe(45);
    expect(state.submissions).toBe(submissions);
  });
});

describe("GamePhases", () => {
  it("should define all phases with correct values", () => {
    expect(GamePhases.UNSTARTED).toBe(0);
    expect(GamePhases.SUBMITTING).toBe(1);
    expect(GamePhases.VOTING).toBe(2);
    expect(GamePhases.RESULT).toBe(3);
  });
});
