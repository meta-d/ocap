import { IXpertRole } from '@metad/contracts'
import { IStudioStorage } from './studio.storage'

export interface IStudioStore {
  draft: IStudioStorage
}

export enum EReloadReason {
  INIT = 'init',
  JUST_RELOAD = 'just_reload',
  CONNECTION_CHANGED = 'connection_changed',
  MOVED = 'moved',
  KNOWLEDGE_CREATED = 'knowledge_created'
}

export type TStateHistory = {
  reason: EReloadReason
  cursor: number
}

export function getXpertRoleKey(role: IXpertRole) {
  return role.key ?? role.id
}
