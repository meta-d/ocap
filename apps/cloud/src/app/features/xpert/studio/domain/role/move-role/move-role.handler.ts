import { IHandler } from '@foblex/mediator';
import { MoveRoleRequest } from './move-role.request';
import { Store, StoreDef } from '@ngneat/elf';
import { IStudioStore } from '../../types';

export class MoveRoleHandler implements IHandler<MoveRoleRequest> {

  constructor(
    private store: Store<StoreDef, IStudioStore>
  ) {
  }

  public handle(request: MoveRoleRequest): void {
    // const state = structuredClone(this.store.getValue().draft)
    // const node = findXpertRole([...state.roles, state.team], request.key)
    // if (!node) {
    //   throw new Error(`Xpert with key ${ request.key } not found`);
    // }
    // node.options ??= {}
    // node.options.position = request.position;
    // this.store.update(() => ({draft: state}))
  }
}
