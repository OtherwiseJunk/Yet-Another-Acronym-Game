export class VotingCardInfo {
  constructor(
    public userId: string,
    public displayName: string,
    public avatarUrl: string,
    public decoratorUrl: string,
    public submissionText: string,
    public submissionTime: number,
    public color: string = ""
  ) {}
}
