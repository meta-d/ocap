import { IXpert } from 'apps/cloud/src/app/@core'

export class UpdateXpertRequest {
  constructor(public readonly xpert: Partial<IXpert>) {}
}
