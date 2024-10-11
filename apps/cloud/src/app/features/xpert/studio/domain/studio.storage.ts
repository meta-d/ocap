import { IXpertRole, TXpertRoleDraft } from '@metad/contracts'
import { getXpertRoleKey } from './types'
import { IKnowledgebaseStorageModel } from './knowledge'

export interface IStudioStorage extends TXpertRoleDraft {
  knowledges: IKnowledgebaseStorageModel[]
}

export function findXpertRole(roles: IXpertRole[], key: string) {
  let leader: IXpertRole = null
  for (const member of roles) {
    if (getXpertRoleKey(member) === key) {
      leader = member
    } else if (member.members?.length) {
      leader = findXpertRole(member.members, key)
    }

    if (leader) {
      return leader
    }
  }

  return leader
}

export function removeXpertRole(roles: IXpertRole[], key: string) {
  return roles?.filter((role) => {
    if (role.members?.length) {
      role.members = removeXpertRole(role.members, key)
    }
    if (getXpertRoleKey(role) === key) {
      return false
    }
    return true
  })
}
