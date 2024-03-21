import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'

/**
 * Store user states for the indicator app
 */
export interface IIndicatorApp extends IBasePerTenantAndOrganizationEntityModel {
  options?: {
    /**
     * The indicators user favorited
     */
    favorites?: string[];
    /**
     * The order of the indicators user sorted
     */
    order?: string[];
    /**
     * Time granularity
     */
    timeGranularity?: TimeGranularity;
    /**
     * Limit the lookback period in trend analysis for every time granularity
     */
    lookback?: Record<TimeGranularity, number>;
    /**
     * Tag type show in indicator list
     */
    tagType?: IndicatorTagEnum;

    /**
     * Periods for detail view
     */
    detailPeriods?: string
  }
}

export enum TimeGranularity {
  Year = 'Year',
  Quarter = 'Quarter',
  Month = 'Month',
  Week = 'Week',
  Day = 'Day'
  // @todo more
}

export enum IndicatorTagEnum {
  UNIT,
  MOM,
  YOY
}