import { IBasePerTenantEntityModel } from "../base-entity.model";

export interface INotificationDestinationType {
    name: string
    type: string
    icon?: string
    
    schema?: Record<string, unknown>
}

export interface INotificationDestination extends IBasePerTenantEntityModel, INotificationDestinationType {

    options?: Record<string, unknown>
}
