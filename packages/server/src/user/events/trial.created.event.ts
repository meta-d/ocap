export class TrialUserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly organizationId: string,
  ) {}
}
