import { IXpertRole, TXpertTeamDraft } from 'apps/cloud/src/app/@core'

export interface IStudioStore {
  draft: TXpertTeamDraft
}

export enum EReloadReason {
  INIT = 'init',
  JUST_RELOAD = 'just_reload',
  CONNECTION_CHANGED = 'connection_changed',
  MOVED = 'moved',
  ROLE_CREATED = 'role_created',
  ROLE_REMOVED = 'role_removed',
  KNOWLEDGE_CREATED = 'knowledge_created',
  KNOWLEDGE_REMOVED = 'knowledge_removed',
  AUTO_LAYOUT = 'auto_layout'
}

export type TStateHistory = {
  reason: EReloadReason
  cursor: number
}

export function getXpertRoleKey(role: IXpertRole) {
  return role.id
}
