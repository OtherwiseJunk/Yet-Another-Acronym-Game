import { UserData } from "./userData";

export class UserSubmission{
    constructor(public submission: string, public answer_time: number, public user_data: UserData){}
}