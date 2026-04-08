import { describe, it, expect } from 'vitest';
import { VotingCardInfo } from './votingCardInfo';

describe('VotingCardInfo', () => {
    it('should store all voting card properties', () => {
        const card = new VotingCardInfo(
            'user-123',
            'PlayerOne',
            'https://cdn.example.com/avatar.png',
            'https://cdn.example.com/deco.png',
            'Some Clever Answer',
            15
        );

        expect(card.userId).toBe('user-123');
        expect(card.displayName).toBe('PlayerOne');
        expect(card.avatarUrl).toBe('https://cdn.example.com/avatar.png');
        expect(card.decoratorUrl).toBe('https://cdn.example.com/deco.png');
        expect(card.submissionText).toBe('Some Clever Answer');
        expect(card.submissionTime).toBe(15);
    });

    it('should default color to empty string', () => {
        const card = new VotingCardInfo('id', 'name', 'avatar', 'deco', 'text', 5);

        expect(card.color).toBe('');
    });

    it('should allow setting color via constructor', () => {
        const card = new VotingCardInfo('id', 'name', 'avatar', 'deco', 'text', 5, '#FF0000');

        expect(card.color).toBe('#FF0000');
    });

    it('should allow color to be reassigned', () => {
        const card = new VotingCardInfo('id', 'name', 'avatar', 'deco', 'text', 5);
        card.color = '#00FF00';

        expect(card.color).toBe('#00FF00');
    });
});
