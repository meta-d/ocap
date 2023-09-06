import { IOrganizationContact } from './organization-contact.model';
import { IBasePerTenantAndOrganizationEntityModel } from './base-entity.model';
import { IEmployee } from './employee.model';

export interface IContact extends IBasePerTenantAndOrganizationEntityModel {
	id?: string;
	name?: string;
	firstName?: string;
	lastName?: string;
	country?: string;
	city?: string;
	address?: string;
	address2?: string;
	postcode?: string;
	latitude?: number;
	longitude?: number;
	regionCode?: string;
	fax?: string;
	fiscalInformation?: string;
	website?: string;
	organization_contacts?: IOrganizationContact[];
	employees?: IEmployee[];
}

export interface IContactFindInput extends IContactCreateInput {
	id?: string;
}

export interface IContactCreateInput
	extends IBasePerTenantAndOrganizationEntityModel {
	name?: string;
	firstName?: string;
	lastName?: string;
	country?: string;
	city?: string;
	address?: string;
	address2?: string;
	postcode?: string;
	latitude?: number;
	longitude?: number;
	regionCode?: string;
	fax?: string;
	fiscalInformation?: string;
	website?: string;
}
