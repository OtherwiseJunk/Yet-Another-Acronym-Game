import { CommandType } from "./CommandType.enum";

export interface ICableCommand<T>{
    type: CommandType;
    data: T;
}