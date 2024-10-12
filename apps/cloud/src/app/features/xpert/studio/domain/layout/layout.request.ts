import { IPoint } from '@foblex/2d'
import { TXpertTeamNode, TXpertTeamNodeType } from 'apps/cloud/src/app/@core';

export class LayoutRequest {
  constructor(public readonly rankdir: 'TB' | 'LR') {}
}
