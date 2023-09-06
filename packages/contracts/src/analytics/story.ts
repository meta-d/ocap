import { ITag } from '../tag-entity.model'
import { Visibility } from '../visibility.model'
import { IBusinessArea } from './business-area'
import { ICollection } from './collection.model'
import { IFavorite } from './favorite'
import { IBasePerProjectEntityModel } from './project.model'
import { IScreenshot } from './screenshot.model'
import { ISemanticModel } from './semantic-model'
import { IStoryPoint } from './story-point'
import { IStoryTemplate } from './story-template.model'

export interface IStory extends IBasePerProjectEntityModel {
  name?: string
  description?: string
  tags?: ITag[]

  status?: StoryStatusEnum

  collection?: ICollection
  collectionId?: string
  
  /**
   * Released story destination
   */
  businessArea?: IBusinessArea
  businessAreaId?: string

  modelId?: string
  /**
   * Story's models space
   */
  model?: ISemanticModel
  /**
   * Story relative models
   */
  models?: ISemanticModel[]

  visibility?: Visibility

  points?: IStoryPoint[]

  options?: Record<string, unknown>

  thumbnail?: string
  previewId?: string
  preview?: IScreenshot

  templateId?: string
  // From template
  template?: IStoryTemplate
  // Save as template
  asTemplate?: IStoryTemplate

  pv?: number
}

export enum StoryStatusEnum {
  /**
   * 草稿
   */
	DRAFT = 'DRAFT',
  /**
   * 重新编辑
   */
	CHANGING = 'CHANGING',
  /**
   * 审阅中
   */
	REVIEW = 'REVIEW',
  /**
   * 通过
   */
	APPROVED = 'APPROVED',
  /**
   * 退回
   */
	REJECTED = 'REJECTED',
  /**
   * 已发布
   */
	RELEASED = 'RELEASED',
  /**
   * 下线存档
   */
	ARCHIVED = 'ARCHIVED',
}

export interface Accessibility {
  access?: AccessEnum
  bookmark?: IFavorite
}

/**
 * 用户对某个实体的访问权限
 */
export enum AccessEnum {
  /**
   * 可看到
   */
  View = 'View',
  /**
   * 可读取详情
   */
  Read = 'Read',
  /**
   * 可编辑
   */
  Write = 'Write'
}
