import { IXpertRole, TXpertRoleDraft } from '@metad/contracts'
import { getXpertRoleKey } from './types'

export interface IStudioStorage extends TXpertRoleDraft {}

export function findXpertRole(roles: IXpertRole[], key: string) {
  let leader = null
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
