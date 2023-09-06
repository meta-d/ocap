import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'

export interface IFeed extends IBasePerTenantAndOrganizationEntityModel {
  type: FeedTypeEnum
  entityId?: string
  hidden?: boolean
  options?: any
}

export enum FeedTypeEnum {
  StoryWidget = 'StoryWidget',
  IndicatorWidget = 'IndicatorWidget',
  Recents = 'Recents',
  Ranking = 'Ranking'
}
