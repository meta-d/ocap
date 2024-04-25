import { IUser } from './user.model';
import { IBasePerTenantEntityModel } from './base-entity.model';
import { IRolePermission } from './role-permission.model';

export interface IRole extends IRoleCreateInput {
	isSystem?: boolean;
	rolePermissions?: IRolePermission[];
	users?: IUser[];
}

export interface IRoleCreateInput extends IBasePerTenantEntityModel {
	name: string
}

export interface IRoleFindInput extends IBasePerTenantEntityModel {
	name?: string;
	isSystem?: boolean;
}

export enum RolesEnum {
	SUPER_ADMIN = 'SUPER_ADMIN',
	ADMIN = 'ADMIN',
	DATA_ENTRY = 'DATA_ENTRY',
	EMPLOYEE = 'EMPLOYEE',
	CANDIDATE = 'CANDIDATE',
	MANAGER = 'MANAGER',
	VIEWER = 'VIEWER',
	// 有所免费用户
	TRIAL = 'TRIAL'
}

export interface IRoleMigrateInput extends IBasePerTenantEntityModel {
	name: string;
	isImporting: boolean;
	sourceId: string;
}

/** Default system role */
export const SYSTEM_DEFAULT_ROLES = [
	RolesEnum.SUPER_ADMIN,
	RolesEnum.ADMIN,
	RolesEnum.EMPLOYEE,
	RolesEnum.CANDIDATE,
	RolesEnum.VIEWER
];
