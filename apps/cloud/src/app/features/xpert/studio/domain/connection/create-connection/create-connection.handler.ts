import { IHandler } from '@foblex/mediator'
import { Store, StoreDef } from '@ngneat/elf'
import { IStudioStore } from '../../types'
import { CreateConnectionRequest } from './create-connection.request'

export class CreateConnectionHandler implements IHandler<CreateConnectionRequest> {
  constructor(private store: Store<StoreDef, IStudioStore>) {}

  public handle(request: CreateConnectionRequest): void {
    this.store.update((state) => {
      const draft = structuredClone(state.draft)

      const outputId = removeSuffix(request.outputId, '/role', '/knowledge', '/toolset')
      // Remove old connection
      if (request.oldFInputId) {
        draft.connections = draft.connections.filter((item) => !(item.from === outputId && item.to === request.oldFInputId))
      }
      
      if (request.inputId && outputId !== request.inputId) {
        // Create new connection
        const targetNode = draft.nodes.find((item) => item.key === request.inputId)
        if (!targetNode) {
          throw new Error(`Target node with id ${request.inputId} not found`)
        }

        const key = outputId + '/' + request.inputId
        if (!draft.connections.some((item) => item.key === key)) {
          draft.connections.push({
            type: targetNode.type,
            key,
            from: outputId,
            to: request.inputId
          })
        }
      }

      return {
        draft
      }
    })

    // const leader = this.getLeader(request.outputId, request.inputId)
    // let member = this.storage.roles.find((item) => getXpertRoleKey(item) === request.inputId)
    // if (member) {
    //   this.storage.roles = this.storage.roles.filter((item) => item !== member)
    // } else {
    //   member = findXpertRole([this.storage.team], request.inputId)
    // }
    // if (!member) {
    //   throw new Error(`Member of ${request.inputId} not found!`)
    // }

    // leader.members ??= []
    // leader.members.push(member)
  }

  // private getLeader(from: string, to: string) {
  //   if (from === to) {
  //     throw new Error(`Cannot call itself`)
  //   }

  //   const leader = findXpertRole([this.storage.team], from)
  //   if (!leader) {
  //     throw new Error(`Leader of ${from} not found!`)
  //   }
  //   return leader

  //   // const result = this.storage.connections.find((x) => {
  //   //   return x.from === from && x.to === to
  //   // })
  //   // if (result) {
  //   //   throw new Error(`Connection from ${from} to ${to} already exists`)
  //   // }
  // }
}

function removeSuffix(str: string, ...suffixs: string[]) {
  suffixs.forEach((suffix) => {
    // 检查字符串是否以指定的后缀结尾
    if (str.endsWith(suffix)) {
      // 使用 slice 方法删除后缀
      str = str.slice(0, -suffix.length)
    }
  })
  
  // 如果字符串不以后缀结尾，则返回原字符串
  return str
}