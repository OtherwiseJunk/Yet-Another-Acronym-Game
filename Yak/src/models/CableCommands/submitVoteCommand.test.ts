import { describe, it, expect } from 'vitest';
import { SubmitAnswerCommand as SubmitVoteCommandMisnamed } from './submitVoteCommand';
import { SubmitAnswerCommand } from './submitAnswerCommand';
import { CommandType } from './commandType.enum';
import { UserSubmission } from '../userSubmission';
import { UserData } from '../userData';

describe('submitVoteCommand - naming bug', () => {
    it('should be named SubmitVoteCommand, not SubmitAnswerCommand', () => {
        expect(SubmitVoteCommandMisnamed.name).toBe('SubmitVoteCommand');
    });

    it('submitVoteCommand should use SubmitVote command type, not SubmitAnswer', () => {
        const command = new SubmitVoteCommandMisnamed('some-vote-data');
        expect(command.type).toBe(CommandType.SubmitVote);
    });

    it('submitAnswerCommand and submitVoteCommand should have different class names', () => {
        expect(SubmitVoteCommandMisnamed.name).not.toBe(SubmitAnswerCommand.name);
    });

    it('submitAnswerCommand should accept UserSubmission data', () => {
        const userData = new UserData('avatar', 'decoration', 'display');
        const submission = new UserSubmission('test answer', 5, userData);
        const command = new SubmitAnswerCommand(submission);

        expect(command.type).toBe(CommandType.SubmitAnswer);
        expect(command.data).toBe(submission);
    });
});
