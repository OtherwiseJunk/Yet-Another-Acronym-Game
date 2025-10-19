import { describe, it, beforeEach, expect, vi } from 'vitest';
import { useGameStore } from './gameStore';
import { createPinia, setActivePinia } from 'pinia';
import { GameState, StartGameCommand, SubmitAnswerCommand, UserData, UserSubmission } from '../models';

interface Channel {
    channel: string;
    instance: string;
    discordUserId: number;
}
let createConsumerReceivedCallback: (data: GameState) => void;
let createdChannel: Channel = null;
let store;

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
        store = useGameStore();
        store.setup("token", "test-instance-id", {} as UserData, 1);
    });
    it('should initialize with default values', () => {

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
        expect(mockConnect).toHaveBeenCalled();
        expect(mockCreate).toHaveBeenCalled();
        expect(createdChannel).toEqual({
            channel: "GameChannel",
            instance: "test-instance-id",
            discordUserId: 1,
        });
    });

    it('should send StartGameCommand when startGame is called', () => {
        store.startGame();

        expect(mockSend).toHaveBeenCalledWith(new StartGameCommand());
    });

    it('should send SubmitAnswerCommand with correct UserSubmission when submitAnswer is called', () => {
        const answer = "Test Answer";
        const expectedUserData = new UserData("avatarUrl", "decorationUrl", "mockedUser");
        const expectedSubmissionData = new UserSubmission(answer, 0, expectedUserData);
        const expectedAnswerSubmission = new SubmitAnswerCommand(expectedSubmissionData);
        store.setup("token", "instance-id", expectedUserData, 1);

        store.submitAnswer(answer);
        
        expect(mockSend).toHaveBeenCalledWith(expectedAnswerSubmission);
    });

    it('should update gameState when data is received', () => {
        const newGameState = new GameState(1, 2, "NEW", new Map([[1, 10]]), [1, 2], 30, new Map([[1, new UserSubmission("Answer", 0, new UserData("avatarUrl", "decorationUrl", "mockedUser"))]]));
        createConsumerReceivedCallback(newGameState);
        
        expect(store.gameState).toEqual(newGameState);
    });
});
