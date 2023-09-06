export class TrialUserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly employeeId: string,
  ) {}
}
