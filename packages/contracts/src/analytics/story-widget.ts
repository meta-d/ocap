import { IBasePerTenantEntityModel } from '../base-entity.model'
import { IStory } from './story'
import { IStoryPoint } from './story-point'

export interface IStoryWidget extends IBasePerTenantEntityModel {
  key?: string
  name?: string

  storyId: string
  story?: IStory
  pointId: string
  point?: IStoryPoint

  options?: Record<string, unknown>
}
