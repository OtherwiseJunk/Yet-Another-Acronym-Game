import { UserSubmission } from "./userSubmission";

export interface RoundScoringEntry {
  votes_received: number;
  voted_for_winner: number;
  speed_bonus: number;
  total: number;
  is_winner: boolean;
}

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
    public votes: Record<string, string> = {},
    public last_round_scoring: Record<string, RoundScoringEntry> = {},
    public last_round_winner_id: string | null = null,
    public cumulative_times: Record<string, number> = {},
    public overall_fastest_player_ids: string[] = [],
  ) {}
}

export enum GamePhases {
  UNSTARTED = 0,
  SUBMITTING = 1,
  VOTING = 2,
  RESULT = 3,
  GAME_OVER = 4,
}
