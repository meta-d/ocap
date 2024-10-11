import { IPoint } from '@foblex/2d';

export class CreateKnowledgeRequest {

  constructor(
    public readonly position: IPoint,
  ) {
  }
}
