import { IPoint } from '@foblex/2d'
import { TXpertTeamNode, TXpertTeamNodeType } from 'apps/cloud/src/app/@core';

export class CreateNodeRequest {
  constructor(
    public readonly type: TXpertTeamNodeType,
    public readonly position: IPoint,
    public readonly entity?: TXpertTeamNode['entity']
  ) {}
}
