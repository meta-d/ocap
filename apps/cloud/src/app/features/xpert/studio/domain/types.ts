import { IXpert, TXpertTeamDraft } from 'apps/cloud/src/app/@core'

export interface IStudioStore {
  draft: TXpertTeamDraft
}

export enum EReloadReason {
  INIT = 'init',
  JUST_RELOAD = 'just_reload',
  CONNECTION_CHANGED = 'connection_changed',
  MOVED = 'moved',
  XPERT_ADDED = 'xpert_added',
  XPERT_UPDATED = 'xpert_updated',
  AGENT_CREATED = 'agent_created',
  AGENT_REMOVED = 'agent_removed',
  KNOWLEDGE_CREATED = 'knowledge_created',
  KNOWLEDGE_REMOVED = 'knowledge_removed',
  TOOLSET_CREATED = 'toolset_created',
  TOOLSET_REMOVED = 'toolset_removed',
  AUTO_LAYOUT = 'auto_layout',
  RESIZE = 'resize'
}

export type TStateHistory = {
  reason: EReloadReason
  cursor: number
}

export function getXpertRoleKey(role: IXpert) {
  return role.id
}
