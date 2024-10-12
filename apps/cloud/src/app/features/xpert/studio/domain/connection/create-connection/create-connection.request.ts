export class CreateConnectionRequest {

  constructor(
    public readonly outputId: string,
    public readonly inputId: string,
    public readonly oldFInputId?: string,
  ) {
  }
}
