import { UserSubmission } from "./userSubmission";

export class GameState {
  constructor(
    public game_phase: GamePhases,
    public round_number: number,
    public current_acronym: string,
    public scores: Record<string, number>,
    public players: string[],
    public round_time_remaining: number,
    public submissions: Record<string, UserSubmission>,
    public game_mode: string | null = null,
    public max_rounds: number | null = null,
    public host_player_id: string | null = null,
  ) {}
}

export enum GamePhases {
  UNSTARTED = 0,
  SUBMITTING = 1,
  VOTING = 2,
  RESULT = 3,
  GAME_OVER = 4,
}
