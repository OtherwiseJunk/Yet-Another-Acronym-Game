import { UserSubmission } from "../userSubmission";
import { ICableCommandWithPayload } from "./command.interface";
import { CommandType } from "./commandType.enum";

export class SubmitAnswerCommand implements ICableCommandWithPayload<UserSubmission>{
    public type = CommandType.SubmitAnswer;
    constructor(public data: UserSubmission){}
}