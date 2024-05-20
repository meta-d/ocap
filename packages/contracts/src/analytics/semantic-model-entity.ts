import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'

export type SemanticModelEntityOptions = {
  vector: {
    hierarchies: string[];
    jobId: string;
  }
}

export interface ISemanticModelEntity extends IBasePerTenantAndOrganizationEntityModel {
  name?: string
  caption?: string
  type?: ModelEntityType

  modelId?: string

  // 存放语义元数据
  options?: SemanticModelEntityOptions
}

export enum ModelEntityType {
  Cube = 'cube',
  Dimension = 'dimension'
}
