import { IHandler } from '@foblex/mediator'
import { IXpertRole } from '@metad/contracts'
import { findXpertRole, IStudioStorage } from '../../studio.storage'
import { CreateConnectionRequest } from './create-connection.request'
import { getXpertRoleKey } from '../../types'

export class CreateConnectionHandler implements IHandler<CreateConnectionRequest> {
  constructor(private storage: IStudioStorage) {}

  public handle(request: CreateConnectionRequest): void {
    const leader = this.getLeader(request.outputId, request.inputId)
    let member = this.storage.roles.find((item) => getXpertRoleKey(item) === request.inputId)
    if (member) {
      this.storage.roles = this.storage.roles.filter((item) => item !== member)
    } else {
      member = findXpertRole([this.storage.team], request.inputId)
    }
    if (!member) {
      throw new Error(`Member of ${request.inputId} not found!`)
    }

    leader.members ??= []
    leader.members.push(member)
  }

  private getLeader(from: string, to: string) {
    if (from === to) {
      throw new Error(`Cannot call itself`)
    }

    const leader = findXpertRole([this.storage.team], from)
    if (!leader) {
      throw new Error(`Leader of ${from} not found!`)
    }
    return leader

    // const result = this.storage.connections.find((x) => {
    //   return x.from === from && x.to === to
    // })
    // if (result) {
    //   throw new Error(`Connection from ${from} to ${to} already exists`)
    // }
  }
}
