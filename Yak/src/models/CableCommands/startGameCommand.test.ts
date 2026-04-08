import { describe, it, expect } from "vitest";
import { StartGameCommand } from "./startGameCommand";
import { CommandType } from "./commandType.enum";

describe("StartGameCommand", () => {
  it("should have type StartGame", () => {
    const command = new StartGameCommand();

    expect(command.type).toBe(CommandType.StartGame);
  });

  it("should have null data", () => {
    const command = new StartGameCommand();

    expect(command.data).toBeNull();
  });
});
