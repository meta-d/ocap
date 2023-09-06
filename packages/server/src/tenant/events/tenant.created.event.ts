export class TenantCreatedEvent {
  constructor(
    public readonly tenantId: string,
  ) {}
}
