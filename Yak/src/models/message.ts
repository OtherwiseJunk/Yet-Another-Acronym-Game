export class Message{
    constructor(
    public author: string,
    public content: string,
    public timestamp: number,
    public avatarUrl: string,
    public avatarDecorationUrl: string
    ){}
}