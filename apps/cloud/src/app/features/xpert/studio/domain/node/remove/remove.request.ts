import { TNodeViewModel } from '../i-view-model'

export class RemoveNodeRequest {
  constructor(public readonly node: TNodeViewModel) {}
}
