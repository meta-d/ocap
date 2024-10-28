import { IBasePerTenantAndOrganizationEntityModel } from './base-entity.model';

export interface ITag extends IBasePerTenantAndOrganizationEntityModel {
	name?: string;
	description?: string;
	category?: TagCategoryEnum
	color?: string
	isSelected?: boolean;
}

export interface ITagName {
	name?: string;
}

export enum TagCategoryEnum {
  INDICATOR = 'indicator',
  STORY = 'story',
  TOOLSET = 'toolset',
  XPERT = 'xpert'
}