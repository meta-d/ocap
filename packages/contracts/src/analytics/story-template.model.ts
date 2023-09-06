import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { ITag } from '../tag-entity.model'
import { IScreenshot } from './screenshot.model'
import { IStory } from './story'

export interface IStoryTemplate extends IBasePerTenantAndOrganizationEntityModel {
  key?: string
  name?: string
  description?: string
  type?: StoryTemplateType
  isPublic?: boolean
  
  tags?: ITag[]

  options?: {
    story?: {
      options?: Record<string, unknown>
    }
    pages?: any[]
  }

  storyId?: string
  story?: IStory
  previewId?: string
  preview?: IScreenshot
  thumbnail?: string
  
  storyCount?: number
}

export enum StoryTemplateType {
  Template = 'Template',
  Theme = 'Theme'
}
