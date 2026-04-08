import { ICableCommandWithPayload } from "./command.interface";
import { CommandType } from "./commandType.enum";

export class SubmitVoteCommand implements ICableCommandWithPayload<string>{
    public type = CommandType.SubmitVote;
    constructor(public data: string){}
}