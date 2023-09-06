import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IStorageFile } from '../storage-file.model'
import { IUser } from '../user.model'
import { ICertification } from './certification.model'
import { IIndicator } from './indicator'
import { ISemanticModel } from './semantic-model'
import { IStory } from './story'

export interface IProject extends IBasePerTenantAndOrganizationEntityModel {
  name?: string
  description?: string
  options?: any
  /**
   * Project owner, can be transfered
   */
  owner?: IUser
  ownerId?: string
  status?: ProjectStatusEnum

  stories?: IStory[]
  indicators?: IIndicator[]
  /**
   * 项目中有权限的用户
   */
  members?: IUser[]
  /**
   * 项目中可用的语义模型
   */
  models?: ISemanticModel[]
  /**
   * 项目中可用的认证
   */
  certifications?: ICertification[]

  /**
   * 项目中的文件素材
   */
  files?: IStorageFile[]
}

export enum ProjectStatusEnum {
  /**
   * 使用中
   */
  Progressing = 'Progressing',

  /**
   * 存档
   */
  Archived = 'Archived'
}

export interface IBasePerProjectEntityModel extends IBasePerTenantAndOrganizationEntityModel {
  projectId?: string
  project?: IProject
}
