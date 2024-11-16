import { IBasePerTenantAndOrganizationEntityModel } from './base-entity.model';
import { I18nObject } from './types';

export interface ITag extends IBasePerTenantAndOrganizationEntityModel {
	name?: string;
	label?: I18nObject
	description?: string;
	category?: TagCategoryEnum
	color?: string
	isSelected?: boolean;
	icon?: string
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