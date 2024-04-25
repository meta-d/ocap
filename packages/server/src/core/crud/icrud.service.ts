
import {
	DeepPartial,
	DeleteResult,
	FindManyOptions,
	FindOneOptions,
	FindOptionsWhere,
	UpdateResult
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { IPagination } from '@metad/contracts';
import { ITryRequest } from './try-request';
import {
	FindOptions as MikroFindOptions,
	FilterQuery as MikroFilterQuery,
	RequiredEntityData,
	UpdateOptions,
	DeleteOptions
} from '@mikro-orm/core';

export interface ICrudService<T> {
	count(filter?: IFindManyOptions<T>): Promise<number>;
	countBy(filter?: ICountByOptions<T>): Promise<number>;
	findAll(filter?: IFindManyOptions<T>): Promise<IPagination<T>>;
	paginate(filter?: IFindManyOptions<T>): Promise<IPagination<T>>;
	/**
	 * @deprecated back compatibility
	 */
	findOne(id: string | IFindWhereOptions<T> | IFindOneOptions<T>, options?: FindOneOptions<T>): Promise<T>
	/**
	 * @deprecated back compatibility
	 */
	findOneOrFail(id: string | IFindOneOptions<T> | IFindWhereOptions<T>, options?: IFindOneOptions<T>): Promise<ITryRequest<T>>
	findOneByIdString(id: string, options?: IFindOneOptions<T>): Promise<T>;
	findOneOrFailByIdString(id: string, options?: IFindOneOptions<T>): Promise<ITryRequest<T>>;
	findOneByOptions(options: IFindOneOptions<T>): Promise<T>;
	findOneByWhereOptions(options: IFindWhereOptions<T>): Promise<T>;
	findOneOrFailByOptions(options: IFindOneOptions<T>): Promise<ITryRequest<T>>;
	findOneOrFailByWhereOptions(options: IFindWhereOptions<T>): Promise<ITryRequest<T>>;
	create(entity: IPartialEntity<T>, ...options: any[]): Promise<T>;
	save(entity: IPartialEntity<T>): Promise<T>;
	update(id: IUpdateCriteria<T>, entity: QueryDeepPartialEntity<T>, ...options: any[]): Promise<UpdateResult | T>;
	delete(id: IDeleteCriteria<T>, ...options: any[]): Promise<DeleteResult>;
	softDelete(id: IDeleteCriteria<T>, ...options: any[]): Promise<UpdateResult | T>;
	softRemove(entity: IPartialEntity<T>, ...options: any[]): Promise<T>;
	softRecover(entity: IPartialEntity<T>, ...options: any[]): Promise<T>;
}

export type IMikroOptions<T> = { where?: MikroFilterQuery<T> } & MikroFindOptions<T>

export type ICountOptions<T> = FindManyOptions<T> | IMikroOptions<T>

export type ICountByOptions<T> = FindOptionsWhere<T> | MikroFilterQuery<T>

export type IFindManyOptions<T> = FindManyOptions<T> | IMikroOptions<T>

export type IFindOneOptions<T> = FindOneOptions<T> | IMikroOptions<T>

export type IFindOrFailOptions<T> = FindOneOptions<T> | IMikroOptions<T>

export type IFindWhereOptions<T> = FindOptionsWhere<T> | MikroFilterQuery<T>

export type IPartialEntity<T> = DeepPartial<T> | RequiredEntityData<T>

export type IUpdateCriteria<T> = string | number | FindOptionsWhere<T> | (UpdateOptions<T> & {
	where?: MikroFilterQuery<T>
})

export type IDeleteCriteria<T> = string | number | FindOptionsWhere<T> | (DeleteOptions<T> & {
	where?: MikroFilterQuery<T>
})
