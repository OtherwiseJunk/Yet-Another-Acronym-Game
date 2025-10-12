import { describe, it, beforeEach, expect } from 'vitest';
import { useGameStore } from './gameStore';
import { createPinia, setActivePinia } from 'pinia';
import { GameState } from '../models';

describe('gameStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    });
    it('should initialize with default values', () => {
        const store = useGameStore();
        const gameState: GameState = store.gameState;
        expect(gameState).toBeDefined();
        expect(gameState.game_phase).toBe(0);
        expect(gameState.round_number).toBe(1);
        expect(gameState.current_acronym).toBe("");
        expect(gameState.scores.size).toBe(0);
        expect(gameState.submissions.size).toBe(0);
        expect(gameState.round_time_remaining).toBe(0);
        expect(gameState.players.length).toBe(0);
    });
});
