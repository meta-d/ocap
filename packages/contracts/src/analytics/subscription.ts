import { IBasePerTenantEntityModel } from "../base-entity.model";
import { INotificationDestination } from "./notification-destination";
import { IStory } from "./story";

export interface ISubscription extends IBasePerTenantEntityModel {

	name: string
    type: SubscriptionType
    description?: string
    /**
     * 启动订阅
     */
    enable?: boolean
    storyId?: string
    story?: IStory
    pointId?: string
    widgetId?: string
    destinationId?: string
    /**
     * 目的地
     */
    destination?: INotificationDestination

    selectedDateType?: string
    sendDate?: string
    sendTime?: string
    miOffice?: boolean
    selectedUser?: string
    selectedGroup?: string
    notifyEveryone?: boolean
    subscriptionDetail?: string
    navigationButton?: boolean
    buttonDesc?: string
    linkSetting?: string
    linkUrl?: string

	options?: Record<string, unknown>
}

export enum SubscriptionType {
    CHART = 'CHART',
    INDICATOR = 'INDICATOR'
}