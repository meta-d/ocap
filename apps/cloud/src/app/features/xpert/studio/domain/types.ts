import { IXpertRole } from '@metad/contracts'

export function getXpertRoleKey(role: IXpertRole) {
  return role.key ?? role.id
}
