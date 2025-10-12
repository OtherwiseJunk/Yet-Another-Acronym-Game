import { describe, it, beforeEach, expect, vi } from 'vitest';
import { useGameStore } from './gameStore';
import { createPinia, setActivePinia } from 'pinia';
import { GameState, StartGameCommand, SubmitAnswerCommand, UserData, UserSubmission } from '../models';

let createConsumerReceivedCallback: (data: any) => void;
let createdChannel: any = null;

const mockSend = vi.fn();
const mockUnsubscribe = vi.fn();
const mockConnect = vi.fn();
const mockCreate = vi.fn((channel, callbacks) => {
                createdChannel = channel;
                createConsumerReceivedCallback = callbacks.received
                return {
                    send: mockSend,
                    unsubscribe: mockUnsubscribe
                };
            })

vi.mock('@rails/actioncable', () => ({
    createConsumer: vi.fn(() => ({
        connect: mockConnect,
        subscriptions: {
            create: mockCreate,
        }
    }))
}));

vi.mock('./discordStore', () => ({
    useDiscordStore: vi.fn(() => ({
        instanceId: 'test-instance-id',
        auth: {
            access_token: 'test-access-token',
            user: { id: 1 }
        },
        currentUserData: new UserData("avatarUrl", "decorationUrl", "mockedUser")
    }))
}));

describe('gameStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks();
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

    it('should call connectToCable on setup', () => {
        const store = useGameStore();
        store.setup();
        expect(mockConnect).toHaveBeenCalled();
        expect(mockCreate).toHaveBeenCalled();
        expect(createdChannel).toEqual({
            channel: "GameChannel",
            instance: "test-instance-id",
            discordUserId: 1,
        });
    });

    it('should send StartGameCommand when startGame is called', () => {
        const store = useGameStore();
        store.setup();
        store.startGame();
        expect(mockSend).toHaveBeenCalledWith(new StartGameCommand());
    });

    it('should send SubmitAnswerCommand with correct UserSubmission when submitAnswer is called', () => {
        const store = useGameStore();
        store.setup();
        const answer = "Test Answer";
        const expectedUserData = new UserData("avatarUrl", "decorationUrl", "mockedUser");
        const expectedSubmission = new UserSubmission(answer, 0, expectedUserData);

        store.submitAnswer(answer);
        expect(mockSend).toHaveBeenCalledWith(new SubmitAnswerCommand(expectedSubmission));
    });

    it('should update gameState when data is received', () => {
        const store = useGameStore();
        store.setup();
        const newGameState = new GameState(1, 2, "NEW", new Map([[1, 10]]), [1,2], 30, new Map([[1, new UserSubmission("Answer", 0, new UserData("avatarUrl", "decorationUrl", "mockedUser"))]]));
        createConsumerReceivedCallback(newGameState);
        expect(store.gameState).toEqual(newGameState);
    });
});
