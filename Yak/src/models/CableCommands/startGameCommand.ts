import { ICableCommand } from "./command.interface";
import { CommandType } from "./commandType.enum";

export class StartGameCommand implements ICableCommand{
    public type = CommandType.StartGame;
    public data = null;
    constructor(){}
}