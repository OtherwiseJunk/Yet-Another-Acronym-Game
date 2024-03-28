import { MessageUserData } from "./userData";

export class Message{
    constructor(
    public content: string,
    public timestamp: number,
    public userData: MessageUserData
    ){}
}