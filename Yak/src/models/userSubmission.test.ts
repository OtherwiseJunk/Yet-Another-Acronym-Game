import { describe, it, expect } from 'vitest';
import { UserSubmission } from './userSubmission';
import { UserData } from './userData';

describe('UserSubmission', () => {
    it('should store submission text, answer time, and user data', () => {
        const userData = new UserData('avatar.png', 'deco.png', 'Player');
        const submission = new UserSubmission('Some Great Answer', 12, userData);

        expect(submission.submission).toBe('Some Great Answer');
        expect(submission.answer_time).toBe(12);
        expect(submission.user_data).toBe(userData);
    });

    it('should allow zero answer time', () => {
        const userData = new UserData('', '', 'SpeedRunner');
        const submission = new UserSubmission('Fast Answer', 0, userData);

        expect(submission.answer_time).toBe(0);
    });
});
