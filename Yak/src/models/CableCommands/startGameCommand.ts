import { ICableCommandWithPayload } from "./command.interface";
import { CommandType } from "./commandType.enum";

export interface StartGameData {
  mode: string;
  max_rounds: number | null;
}

export class StartGameCommand implements ICableCommandWithPayload<StartGameData | null> {
  public type = CommandType.StartGame;
  constructor(public data: StartGameData | null = null) {}
}
