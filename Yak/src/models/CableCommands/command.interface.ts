import { CommandType } from "./commandType.enum";

export interface ICableCommandWithPayload<T>{
    type: CommandType;
    data: T;
}

export interface ICableCommand{
    type: CommandType;
}