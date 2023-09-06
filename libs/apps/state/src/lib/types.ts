/* eslint-disable @typescript-eslint/member-ordering */
import {
  AnalyticsPermissionsEnum,
  IDataSource,
  IIndicator,
  ISemanticModel,
  IStory,
  IStoryWidget,
  IndicatorOptionFields,
  PermissionsEnum
} from '@metad/contracts'
import { Indicator as OCAPIndicator, SemanticModel, isNil, omit, omitBy, pick } from '@metad/ocap-core'
import { Story, StoryConnection, StoryModel, StoryPoint, StoryWidget, uuid } from '@metad/story/core'
import { convertNewSemanticModelResult } from './models.service'

export enum BusinessType {
  SEMANTIC_MODEL = 'SEMANTIC_MODEL',
  STORY = 'STORY',
  INDICATOR = 'INDICATOR'
}

export enum ThemesEnum {
  default = 'default',
  dark = 'dark',
  thin = 'thin'
}

export const SystemPrivacyFields = [
  'createdById',
  'createdBy',
  'updatedById',
  'updatedBy',
  'createdAt',
  'updatedAt',
  'tenantId',
  'tenant',
  'organizationId',
  'organization',
  'visibility'
]

const SYSTEM_FIELDS = [
  'id',
  'name',
  ...SystemPrivacyFields
]

export interface Indicator extends Partial<OCAPIndicator>, Omit<IIndicator, 'type'> {
  //
}

/**
 * @deprecated 是否还在用?
 */
export function convertConnectionResult(result: IDataSource): StoryConnection {
  const connection: StoryConnection = result as StoryConnection

  // TODO 非本地代理先这样处理, 后续改成 HttpAgent 服务统一处理
  if (!result.useLocalAgent) {
    connection.options = {
      dataSourceInfo: result.options?.data_source_info,
      dialect: result.options?.dialect
    }
  }
  return connection
}

export function convertStoryModel(model: Partial<StoryModel>): ISemanticModel {
  const updateModel: ISemanticModel = {
    name: model.name,
    key: model.key,
    type: model.type,
    businessAreaId: model.businessAreaId,
    catalog: model.catalog,
    cube: model.cube,
    dataSourceId: model.dataSourceId,
    preferences: model.preferences
  }

  if (model.schema) {
    updateModel.options = pick(model, 'settings', 'schema')
  }

  return updateModel
}

/**
 * @deprecated use convertNewSemanticModelResult
 *
 * @param result
 * @returns
 */
export function convertStoryModelResult(result: ISemanticModel): StoryModel {
  return {
    ...result.options,
    ...result,
    type: result.type as SemanticModel['type'],
    dataSource: result.dataSource as StoryConnection,
    indicators: result.indicators?.map(convertIndicatorResult)
  }
}

export function convertStory(story: Partial<Story>): Partial<Story> {
  return omitBy(
    {
      name: story.name,
      description: story.description,
      modelId: story.model?.id ?? story.modelId,
      projectId: story.projectId,
      collectionId: story.collectionId,
      businessAreaId: story.businessAreaId,
      previewId: story.previewId,
      thumbnail: story.thumbnail,
      status: story.status,
      templateId: story.templateId,
      // 服务端暂不支持级联更新多对多表
      // models: story.models.map((item) => ({id: item.id})),
      points: story.points?.map(convertStoryPoint),
      options: pick(story, 'title', 'filterBar', 'options', 'schema', 'schemas')
    },
    isNil
  )
}

export function convertStoryResult(result: Partial<IStory>): Story {
  return {
    ...result.options,
    ...omit(result, 'options'),
    options: result.options?.options,
    model: (result.model ? convertNewSemanticModelResult(result.model) : null) as StoryModel,
    models: result.models?.map(convertNewSemanticModelResult),
    points: result.points?.map(convertStoryPointResult)
  }
}

export function convertStoryPoint(storyPoint: StoryPoint) {
  return omitBy(
    {
      ...pick(storyPoint, 'key', 'storyId', 'name'),
      options: omit(storyPoint, 'storyId', 'widgets', ...SYSTEM_FIELDS),
      widgets: storyPoint.widgets?.map(convertStoryWidget)
    },
    isNil
  )
}

export function convertStoryWidget(widget: StoryWidget): IStoryWidget {
  return {
    ...pick(widget, 'key', 'storyId', 'pointId', 'name'),
    options: omit(widget, 'storyId', 'pointId', 'key', ...SYSTEM_FIELDS)
  } as IStoryWidget
}

export function convertStoryPointResult(result) {
  const widgets = result.widgets?.map((item) => convertStoryWidgetResult(item))
  return {
    ...result.options,
    ...omit(result, 'options'),
    key: result.key ?? result.options?.key ?? uuid(), // Backward compatibility
    id: result.id,
    name: result.name,
    storyId: result.storyId,
    widgets
  }
}

export function convertStoryWidgetResult(result: IStoryWidget): StoryWidget {
  return {
    ...result.options,
    ...omit(result, 'options', ...SystemPrivacyFields),
    id: result.id,
    key: result.key ?? result.options?.key ?? uuid(), // Backward compatibility
    name: result.name,
    storyId: result.storyId,
    pointId: result.pointId,
    point: result.point ? convertStoryPointResult(result.point) : result.point
  } as StoryWidget
}

export function convertIndicator(input: Partial<Indicator>) {
  return {
    ...omit(input, ...IndicatorOptionFields),
    options: pick(input, ...IndicatorOptionFields)
  }
}

export function convertIndicatorResult(result: IIndicator): any {
  return {
    ...omit(result, 'options'),
    ...(result.options ?? {})
  } as any
}

// /**
//  * @deprecated
//  */
// export enum FeatureEnum {
//   FEATURE_DASHBOARD = 'FEATURE_DASHBOARD',
//   FEATURE_TIME_TRACKING = 'FEATURE_TIME_TRACKING',
//   FEATURE_ESTIMATE = 'FEATURE_ESTIMATE',
//   FEATURE_ESTIMATE_RECEIVED = 'FEATURE_ESTIMATE_RECEIVED',
//   FEATURE_INVOICE = 'FEATURE_INVOICE',
//   FEATURE_INVOICE_RECURRING = 'FEATURE_INVOICE_RECURRING',
//   FEATURE_INVOICE_RECEIVED = 'FEATURE_INVOICE_RECEIVED',
//   FEATURE_INCOME = 'FEATURE_INCOME',
//   FEATURE_EXPENSE = 'FEATURE_EXPENSE',
//   FEATURE_PAYMENT = 'FEATURE_PAYMENT',
//   FEATURE_PROPOSAL = 'FEATURE_PROPOSAL',
//   FEATURE_PROPOSAL_TEMPLATE = 'FEATURE_PROPOSAL_TEMPLATE',
//   FEATURE_PIPELINE = 'FEATURE_PIPELINE',
//   FEATURE_PIPELINE_DEAL = 'FEATURE_PIPELINE_DEAL',
//   FEATURE_DASHBOARD_TASK = 'FEATURE_DASHBOARD_TASK',
//   FEATURE_TEAM_TASK = 'FEATURE_TEAM_TASK',
//   FEATURE_MY_TASK = 'FEATURE_MY_TASK',
//   FEATURE_JOB = 'FEATURE_JOB',
//   FEATURE_EMPLOYEES = 'FEATURE_EMPLOYEES',
//   FEATURE_EMPLOYEE_TIME_ACTIVITY = 'FEATURE_EMPLOYEE_TIME_ACTIVITY',
//   FEATURE_EMPLOYEE_TIMESHEETS = 'FEATURE_EMPLOYEE_TIMESHEETS',
//   FEATURE_EMPLOYEE_APPOINTMENT = 'FEATURE_EMPLOYEE_APPOINTMENT',
//   FEATURE_EMPLOYEE_APPROVAL = 'FEATURE_EMPLOYEE_APPROVAL',
//   FEATURE_EMPLOYEE_APPROVAL_POLICY = 'FEATURE_EMPLOYEE_APPROVAL_POLICY',
//   FEATURE_EMPLOYEE_LEVEL = 'FEATURE_EMPLOYEE_LEVEL',
//   FEATURE_EMPLOYEE_POSITION = 'FEATURE_EMPLOYEE_POSITION',
//   FEATURE_EMPLOYEE_TIMEOFF = 'FEATURE_EMPLOYEE_TIMEOFF',
//   FEATURE_EMPLOYEE_RECURRING_EXPENSE = 'FEATURE_EMPLOYEE_RECURRING_EXPENSE',
//   FEATURE_EMPLOYEE_CANDIDATE = 'FEATURE_EMPLOYEE_CANDIDATE',
//   FEATURE_MANAGE_INTERVIEW = 'FEATURE_MANAGE_INTERVIEW',
//   FEATURE_MANAGE_INVITE = 'FEATURE_MANAGE_INVITE',
//   FEATURE_ORGANIZATION = 'FEATURE_ORGANIZATION',
//   FEATURE_ORGANIZATION_EQUIPMENT = 'FEATURE_ORGANIZATION_EQUIPMENT',
//   FEATURE_ORGANIZATION_INVENTORY = 'FEATURE_ORGANIZATION_INVENTORY',
//   FEATURE_ORGANIZATION_TAG = 'FEATURE_ORGANIZATION_TAG',
//   FEATURE_ORGANIZATION_VENDOR = 'FEATURE_ORGANIZATION_VENDOR',
//   FEATURE_ORGANIZATION_PROJECT = 'FEATURE_ORGANIZATION_PROJECT',
//   FEATURE_ORGANIZATION_DEPARTMENT = 'FEATURE_ORGANIZATION_DEPARTMENT',
//   FEATURE_ORGANIZATION_TEAM = 'FEATURE_ORGANIZATION_TEAM',
//   FEATURE_ORGANIZATION_DOCUMENT = 'FEATURE_ORGANIZATION_DOCUMENT',
//   FEATURE_ORGANIZATION_EMPLOYMENT_TYPE = 'FEATURE_ORGANIZATION_EMPLOYMENT_TYPE',
//   FEATURE_ORGANIZATION_RECURRING_EXPENSE = 'FEATURE_ORGANIZATION_RECURRING_EXPENSE',
//   FEATURE_ORGANIZATION_HELP_CENTER = 'FEATURE_ORGANIZATION_HELP_CENTER',
//   FEATURE_CONTACT = 'FEATURE_CONTACT',
//   FEATURE_GOAL = 'FEATURE_GOAL',
//   FEATURE_GOAL_REPORT = 'FEATURE_GOAL_REPORT',
//   FEATURE_GOAL_SETTING = 'FEATURE_GOAL_SETTING',
//   FEATURE_REPORT = 'FEATURE_REPORT',
//   FEATURE_USER = 'FEATURE_USER',
//   FEATURE_ORGANIZATIONS = 'FEATURE_ORGANIZATIONS',
//   FEATURE_APP_INTEGRATION = 'FEATURE_APP_INTEGRATION',
//   FEATURE_SETTING = 'FEATURE_SETTING',
//   FEATURE_EMAIL_HISTORY = 'FEATURE_EMAIL_HISTORY',
//   FEATURE_EMAIL_TEMPLATE = 'FEATURE_EMAIL_TEMPLATE',
//   FEATURE_IMPORT_EXPORT = 'FEATURE_IMPORT_EXPORT',
//   FEATURE_FILE_STORAGE = 'FEATURE_FILE_STORAGE',
//   FEATURE_PAYMENT_GATEWAY = 'FEATURE_PAYMENT_GATEWAY',
//   FEATURE_SMS_GATEWAY = 'FEATURE_SMS_GATEWAY',
//   FEATURE_SMTP = 'FEATURE_SMTP',
//   FEATURE_ROLES_PERMISSION = 'FEATURE_ROLES_PERMISSION'
// }

// /**
//  * @deprecated
//  */
// export enum AnalyticsFeatures {
//   FEATURE_BUSINESS_GROUP = 'FEATURE_BUSINESS_GROUP',
//   FEATURE_INDICATOR = 'FEATURE_INDICATOR',
//   FEATURE_INDICATOR_MARKET = 'FEATURE_INDICATOR_MARKET',
//   FEATURE_INDICATOR_REGISTER = 'FEATURE_INDICATOR_REGISTER',
//   FEATURE_INDICATOR_MY = 'FEATURE_INDICATOR_MY',
//   FEATURE_INDICATOR_VIEWER = 'FEATURE_INDICATOR_VIEWER',
//   FEATURE_STORY = 'FEATURE_STORY',
//   FEATURE_STORY_CREATION = 'FEATURE_STORY_CREATION',
//   FEATURE_STORY_VIEWER = 'FEATURE_STORY_VIEWER',
//   FEATURE_STORY_MARKET = 'FEATURE_STORY_MARKET',
//   FEATURE_MODEL = 'FEATURE_MODEL',
//   FEATURE_MODEL_CREATION = 'FEATURE_MODEL_CREATION',
//   FEATURE_MODEL_VIEWER = 'FEATURE_MODEL_VIEWER',
//   FEATURE_SUBSCRIPTION = 'FEATURE_SUBSCRIPTION',
//   FEATURE_INSIGHT = 'FEATURE_INSIGHT',
//   FEATURE_INSIGHT_ADMIN = 'FEATURE_INSIGHT_ADMIN',
//   FEATURE_INSIGHT_VIEWER = 'FEATURE_INSIGHT_VIEWER'
// }

// /**
//  * @deprecated
//  */
// export enum RolesEnum {
//   SUPER_ADMIN = 'SUPER_ADMIN',
//   ADMIN = 'ADMIN',
//   DATA_ENTRY = 'DATA_ENTRY',
//   EMPLOYEE = 'EMPLOYEE',
//   CANDIDATE = 'CANDIDATE',
//   MANAGER = 'MANAGER',
//   VIEWER = 'VIEWER',
//   TRIAL = 'TRIAL'
// }

// /**
//  * @deprecated
//  */
// export enum OrganizationPermissionsEnum {
//   ALLOW_MANUAL_TIME = 'allowManualTime',
//   ALLOW_MODIFY_TIME = 'allowModifyTime',
//   ALLOW_DELETE_TIME = 'allowDeleteTime',
//   ALLOW_FUTURE_DATE = 'futureDateAllowed'
// }

export enum IndicatorType {
  BASIC = 'BASIC',
  DERIVE = 'DERIVE'
}

/**
 * @deprecated
 */
export const PermissionGroups = {
  //Permissions which can be given to any role
  GENERAL: [
    PermissionsEnum.ADMIN_DASHBOARD_VIEW,
    PermissionsEnum.ORG_INVITE_VIEW,
    PermissionsEnum.ORG_INVITE_EDIT,
    PermissionsEnum.POLICY_VIEW,
    PermissionsEnum.POLICY_EDIT,
    PermissionsEnum.ORG_TAGS_EDIT,
    PermissionsEnum.VIEW_ALL_EMAILS,
    PermissionsEnum.VIEW_ALL_EMAIL_TEMPLATES,
    PermissionsEnum.ORG_HELP_CENTER_EDIT,
    PermissionsEnum.ORG_CONTACT_EDIT,
    PermissionsEnum.ORG_CONTACT_VIEW,
    PermissionsEnum.ORG_TEAM_EDIT,
    PermissionsEnum.ORG_CONTRACT_EDIT,
    PermissionsEnum.EVENT_TYPES_VIEW,
    PermissionsEnum.VIEW_ALL_ACCOUNTING_TEMPLATES,

    // DataSource
    AnalyticsPermissionsEnum.DATA_SOURCE_VIEW,
    AnalyticsPermissionsEnum.DATA_SOURCE_EDIT,
    // Semantic Model
    AnalyticsPermissionsEnum.MODELS_VIEW,
    AnalyticsPermissionsEnum.MODELS_EDIT,
    // Story
    AnalyticsPermissionsEnum.STORIES_VIEW,
    AnalyticsPermissionsEnum.STORIES_EDIT,
    // BusinessGroup
    AnalyticsPermissionsEnum.BUSINESS_AREA_VIEW,
    AnalyticsPermissionsEnum.BUSINESS_AREA_EDIT,
    // Indicator
    AnalyticsPermissionsEnum.INDICATOR_VIEW,
    AnalyticsPermissionsEnum.INDICATOR_MARTKET_VIEW,
    AnalyticsPermissionsEnum.INDICATOR_EDIT,
    // Insight
    AnalyticsPermissionsEnum.INSIGHT_VIEW,
    AnalyticsPermissionsEnum.INSIGHT_EDIT,
    // Subscription
    AnalyticsPermissionsEnum.SUBSCRIPTION_VIEW,
    AnalyticsPermissionsEnum.SUBSCRIPTION_EDIT
  ],

  //Readonly permissions, are only enabled for admin role
  ADMINISTRATION: [
    PermissionsEnum.ORG_EMPLOYEES_VIEW,
    PermissionsEnum.ORG_EMPLOYEES_EDIT,
    PermissionsEnum.ORG_USERS_VIEW,
    PermissionsEnum.ORG_USERS_EDIT,
    PermissionsEnum.ALL_ORG_VIEW,
    PermissionsEnum.ALL_ORG_EDIT,
    PermissionsEnum.CHANGE_SELECTED_ORGANIZATION,
    PermissionsEnum.CHANGE_ROLES_PERMISSIONS,
    PermissionsEnum.SUPER_ADMIN_EDIT,
    PermissionsEnum.PUBLIC_PAGE_EDIT,
    PermissionsEnum.INTEGRATION_VIEW,
    PermissionsEnum.FILE_STORAGE_VIEW,
    PermissionsEnum.SMS_GATEWAY_VIEW,
    PermissionsEnum.CUSTOM_SMTP_VIEW,
    PermissionsEnum.IMPORT_EXPORT_VIEW,
    PermissionsEnum.ACCESS_DELETE_ACCOUNT,
    PermissionsEnum.ACCESS_DELETE_ALL_DATA
  ]
}
