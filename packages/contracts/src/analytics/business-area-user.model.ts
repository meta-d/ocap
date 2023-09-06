import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model';
import { LanguagesEnum, IUser } from '../user.model';
import { IBusinessArea } from './business-area';

export enum BusinessAreaRole {
	Adminer,
	Modeler,
	Viewer
}

export interface IBusinessAreaUser
	extends IBasePerTenantAndOrganizationEntityModel {
	businessAreaId: string
	businessArea?: IBusinessArea
	userId: string;
	isDefault: boolean;
	isActive: boolean;
	user?: IUser;
	role: BusinessAreaRole
}

export interface IBusinessAreaUserFindInput
	extends IBasePerTenantAndOrganizationEntityModel {
	businessAreaId?: string
	id?: string;
	userId?: string;
	isDefault?: boolean;
	isActive?: boolean;
}

export interface IBusinessAreaUserCreateInput
	extends IBasePerTenantAndOrganizationEntityModel {
	businessAreaId: string
	userId: string;
	isDefault?: boolean;
	isActive?: boolean;
}

export interface IBusinessAreaUserDeleteInput {
	userbusinessAreaId: string;
	requestingUser: IUser;
	language?: LanguagesEnum;
}
