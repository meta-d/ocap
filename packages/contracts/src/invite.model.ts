import { IRole } from './role.model';
import { IBasePerTenantAndOrganizationEntityModel } from './base-entity.model';
import { IUser, IUserCodeInput, IUserEmailInput, IUserRegistrationInput, IUserTokenInput, LanguagesEnum } from './user.model';
import { IOrganization } from './organization.model';
import { IOrganizationContact } from './organization-contact.model';
import { IOrganizationDepartment } from './organization-department.model';
import { IEmployee } from './employee.model';

export interface IInvite extends IBasePerTenantAndOrganizationEntityModel, IUserEmailInput, IUserTokenInput, Partial<IUserCodeInput> {
	token: string;
	email: string;
	roleId: string;
	invitedById: string;
	status: string;
	expireDate: Date;
	actionDate?: Date;
	role?: IRole;
	invitedBy?: IUser;
	organizationContacts?: IOrganizationContact[];
	departments?: IOrganizationDepartment[];
	fullName?: string;
	isExpired?: boolean;
}

export interface IInviteAcceptInput extends IUserRegistrationInput {
	inviteId: string;
	organization: IOrganization;
	originalUrl?: string;
}

export interface IInviteResendInput extends IBasePerTenantAndOrganizationEntityModel {
	inviteId: IInvite['id'];
	inviteType: InvitationTypeEnum;
	[x: string]: any;
}

export interface ICreateEmailInvitesInput
	extends IBasePerTenantAndOrganizationEntityModel {
	emailIds: string[];
	projectIds?: string[];
	organizationContactIds?: string[];
	departmentIds?: string[];
	roleId: string;
	invitedById: string;
	inviteType: any;
	startedWorkOn: Date;
	appliedDate?: Date;
	invitationExpirationPeriod?: number | string;
}

export interface ICreateOrganizationContactInviteInput
	extends IBasePerTenantAndOrganizationEntityModel {
	emailId: string;
	organizationContactId: string;
	roleId: string;
	invitedById: string;
	originalUrl: string;
	languageCode: LanguagesEnum;
}

export interface ICreateEmailInvitesOutput {
	items: IInvite[];
	total: number;
	ignored: number;
}

export interface IInviteFindInput
	extends IBasePerTenantAndOrganizationEntityModel {
	invitationType?: InvitationTypeEnum;
}

export interface IPublicInviteFindInput {
	email: string;
	token: string;
}

export interface IInviteUpdateInput {
	status: InviteStatusEnum;
}

export enum InviteStatusEnum {
	INVITED = 'INVITED',
	ACCEPTED = 'ACCEPTED'
}

export enum InvitationTypeEnum {
	USER = 'USER',
	EMPLOYEE = 'EMPLOYEE',
	CANDIDATE = 'CANDIDATE',
	TEAM = 'TEAM'
}

export enum InvitationExpirationEnum {
	DAY = 1,
	WEEK = 7,
	TWO_WEEK = 14,
	MONTH = 30,
	NEVER = 'Never'
}

export interface IInviteViewModel {
	email: string;
	expireDate: string;
	createdDate: string;
	imageUrl: string;
	fullName: string;
	roleName?: string;
	status: string;
	projectNames: string[];
	clientNames: string[];
	departmentNames: string[];
	id: string;
	inviteUrl: string;
}

export interface IInviteUserModel
	extends IBasePerTenantAndOrganizationEntityModel {
	email: string;
	role: string;
	registerUrl: string;
	languageCode: LanguagesEnum;
	invitedBy: IUser;
	originUrl?: string;
}
export interface IInviteEmployeeModel
	extends IBasePerTenantAndOrganizationEntityModel {
	email: string;
	registerUrl: string;
	languageCode: LanguagesEnum;
	invitedBy: IUser;
	organizationContacts?: IOrganizationContact[];
	departments?: IOrganizationDepartment[];
	originUrl?: string;
}

export interface IJoinEmployeeModel extends IBasePerTenantAndOrganizationEntityModel {
    email: string;
    employee: IEmployee;
    organization: IOrganization;
    languageCode: LanguagesEnum;
}
