import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IIndicator } from './indicator'
import { ISemanticModel } from './semantic-model'
import { IStory } from './story'

export interface IVisit extends IBasePerTenantAndOrganizationEntityModel {
  type: VisitTypeEnum
  entity: VisitEntityEnum
  entityId: string
  entityName?: string
  businessAreaId?: string
  visitAt?: number
  visits?: number

  story?: IStory
  model?: ISemanticModel
  indicator?: IIndicator
}

export enum VisitEntityEnum {
  DataSource = 'DataSource',
  SemanticModel = 'SemanticModel',
  Story = 'Story',
  Widget = 'Widget',
  Indicator = 'Indicator'
}

export enum VisitTypeEnum {
  View = 'View',
  Data = 'Data'
}

export interface IEntityVisits {
  entity?: VisitEntityEnum
  entityId: string
  entityName: string
  pv?: number
  uv?: number
}