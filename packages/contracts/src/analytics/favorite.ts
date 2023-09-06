import { BusinessType } from './business-area'
import { IIndicator } from './indicator'
import { IBasePerProjectEntityModel } from './project.model'
import { ISemanticModel } from './semantic-model'
import { IStory } from './story'

export interface IFavorite extends IBasePerProjectEntityModel {
  type?: BusinessType

  modelId?: string
  model?: ISemanticModel

  storyId?: string
  story?: IStory

  indicatorId?: string
  indicator?: IIndicator
}
