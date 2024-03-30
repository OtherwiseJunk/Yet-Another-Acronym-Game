import { Message } from "../message";
import { ICableCommand } from "./command.interface";
import { CommandType } from "./CommandType.enum";

export class NewMessageCommand implements ICableCommand<Message>{
    public type = CommandType.NewMessage;
    constructor(public data: Message){}
}