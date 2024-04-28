import { UserSubmission } from "./userSubmission";

export class GameState{
    constructor(
        public game_phase: GamePhases,
        public round_number: number,
        public current_acronym: string,
        public scores: Map<number, number>,
        public players: number[],
        public round_time_remaining: number,
        public submissions: Map<number,UserSubmission>
    ){}
}

export enum GamePhases{
    UNSTARTED = 0,
    SUBMITTING = 1,
    VOTING = 2,
    RESULT = 3
}