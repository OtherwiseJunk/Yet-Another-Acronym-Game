import { describe, it, expect } from 'vitest';
import { SubmitAnswerCommand } from './submitAnswerCommand';
import { CommandType } from './commandType.enum';
import { UserSubmission } from '../userSubmission';
import { UserData } from '../userData';

describe('SubmitAnswerCommand', () => {
    it('should have type SubmitAnswer', () => {
        const userData = new UserData('avatar', 'decoration', 'display');
        const submission = new UserSubmission('test answer', 5, userData);
        const command = new SubmitAnswerCommand(submission);

        expect(command.type).toBe(CommandType.SubmitAnswer);
    });

    it('should store the UserSubmission as data', () => {
        const userData = new UserData('avatar', 'decoration', 'display');
        const submission = new UserSubmission('my answer', 10, userData);
        const command = new SubmitAnswerCommand(submission);

        expect(command.data).toBe(submission);
        expect(command.data.submission).toBe('my answer');
        expect(command.data.answer_time).toBe(10);
        expect(command.data.user_data).toBe(userData);
    });

});
