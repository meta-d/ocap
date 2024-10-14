import { IPoint, IXpertRole } from 'apps/cloud/src/app/@core'

export class CreateTeamRequest {
  constructor(
    public readonly position: IPoint,
    public readonly team?: IXpertRole
  ) {}
}
