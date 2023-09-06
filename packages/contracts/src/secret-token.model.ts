import { IBaseEntityModel } from './base-entity.model';

export interface ISecretToken
	extends IBaseEntityModel {
	entityId?: string
	token: string;
	validUntil?: Date;
	expired?: boolean;
}

export interface ISecretTokenFindInput
	extends IBaseEntityModel {
	entityId?: string
	token?: string;
}