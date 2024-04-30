import { ICableCommandWithPayload } from "./command.interface";
import { CommandType } from "./commandType.enum";

export class SubmitAnswerCommand implements ICableCommandWithPayload<string>{
    public type = CommandType.SubmitAnswer;
    constructor(public data: string){}
}