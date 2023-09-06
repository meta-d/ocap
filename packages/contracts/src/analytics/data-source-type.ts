import { IBasePerTenantEntityModel } from "../base-entity.model"

export interface IDataSourceType extends IBasePerTenantEntityModel {
    name?: string
    type?: string
    syntax?: string
    protocol?: string
    configuration?: Record<string, unknown>
}

export enum DataSourceSyntaxEnum {
    
}

export enum DataSourceProtocolEnum {
    
}