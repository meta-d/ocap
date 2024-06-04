export class TenantCreatedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly tenantName: string,
  ) {}
}
