import { IXpertAgent } from "apps/cloud/src/app/@core";

export class UpdateAgentRequest {
  constructor(
    public readonly key: string,
    public readonly entity: Partial<IXpertAgent>,
  ) {
  }
}
