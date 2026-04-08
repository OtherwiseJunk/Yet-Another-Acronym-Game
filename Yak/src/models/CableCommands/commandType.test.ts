import { describe, it, expect } from 'vitest';
import { CommandType } from './commandType.enum';

describe('CommandType', () => {
    it('should define StartGame as 0', () => {
        expect(CommandType.StartGame).toBe(0);
    });

    it('should define SubmitAnswer as 1', () => {
        expect(CommandType.SubmitAnswer).toBe(1);
    });

    it('should define SubmitVote as 2', () => {
        expect(CommandType.SubmitVote).toBe(2);
    });

    it('should have exactly 3 command types', () => {
        // Enum has double the keys (name->value and value->name)
        const keys = Object.keys(CommandType).filter(k => isNaN(Number(k)));
        expect(keys).toHaveLength(3);
    });
});
