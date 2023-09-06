import { IBasePerProjectEntityModel } from './project.model'


export interface ICollection extends IBasePerProjectEntityModel {
  name?: string
  parentId?: string
  level?: number
}
