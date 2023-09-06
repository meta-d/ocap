import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
	DeepPartial,
	DeleteResult,
	FindConditions,
	FindManyOptions,
	FindOneOptions,
	Repository,
	SelectQueryBuilder,
	UpdateResult
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { mergeMap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import * as moment from 'moment';
import { environment as env } from '@metad/server-config';
import { BaseEntity } from '../entities/internal';
import { ICrudService } from './icrud.service';
import { IPagination } from '@metad/contracts';
import { ITryRequest } from './try-request';
import { filterQuery } from './query-builder';
import { RequestContext } from '../context';

export abstract class CrudService<T extends BaseEntity>
	implements ICrudService<T> {
	/**
	 * Alias (default we used table name) for pagination crud
	 */
	protected get alias(): string {
		return this.repository.metadata.tableName;
	}

	protected constructor(
		protected readonly repository: Repository<T>
	) {}
	
	public async count(filter?: FindManyOptions<T>): Promise<number> {
		return await this.repository.count(filter);
	}

	public async findAll(filter?: FindManyOptions<T>): Promise<IPagination<T>> {
		const total = await this.repository.count(filter);
		const items = await this.repository.find(filter);
		return { items, total };
	}

	public async paginate(filter?: any): Promise<IPagination<T>> {
		try {
			const options: FindManyOptions = {};
			options.skip = filter && filter.skip ? (filter.take * (filter.skip - 1)) : 0;
			options.take = filter && filter.take ? (filter.take) : 10;
			if (filter) {
				if (filter.orderBy && filter.order) {
					options.order = {
						[filter.orderBy]: filter.order
					}
				} else if (filter.orderBy) {
					options.order = filter.orderBy;
				}
				if (filter.relations) {
					options.relations = filter.relations;
				}
				if (filter.join) {
					options.join = filter.join;
				}
			}
			options.where = (qb: SelectQueryBuilder<T>) => {
				if (filter && (filter.filters || filter.where)) {
					if (filter.where) {
						const wheres: any = {}
						for (const field in filter.where) {
							if (Object.prototype.hasOwnProperty.call(filter.where, field)) {
								wheres[field] = filter.where[field];
							}
						}
						filterQuery(qb, wheres);
					}
				}
				const tenantId = RequestContext.currentTenantId();
				qb.andWhere(`"${qb.alias}"."tenantId" = :tenantId`, { tenantId });
				console.log(qb.getQueryAndParameters(), moment().format('DD.MM.YYYY HH:mm:ss'));
			}
			console.log(filter, moment().format('DD.MM.YYYY HH:mm:ss'));
			const [items, total] = await this.repository.findAndCount(options);
			return { items, total };
		} catch (error) {
			throw new BadRequestException(error);
		}
	}

	public async findOneOrFail(
		id: string | number | FindOneOptions<T> | FindConditions<T>,
		options?: FindOneOptions<T>
	): Promise<ITryRequest> {
		try {
			const record = await this.repository.findOneOrFail(
				id as string,
				options
			);
			return {
				success: true,
				record
			};
		} catch (error) {
			return {
				success: false,
				error
			};
		}
	}

	public async findOne(
		id: string | number | FindOneOptions<T> | FindConditions<T>,
		options?: FindOneOptions<T>
	): Promise<T> {
		const record = await this.repository.findOne(id as string, options);
		if (!record) {
			throw new NotFoundException(`The requested record was not found`);
		}
		return record;
	}

	/**
	 * Finds first entity that matches given id and options.
	 *
	 * @param id {string}
	 * @param options
	 * @returns
	 */
	public async findOneByIdString(
		id: string,
		options?: FindOneOptions<T>
	): Promise<T> {
		const record = await this.repository.findOne(
			id,
			options
		);
		if (!record) {
			throw new NotFoundException(`The requested record was not found`);
		}
		return record;
	}

	/**
	 * Finds first entity that matches given options.
	 *
	 * @param options
	 * @returns
	 */
	public async findOneByOptions(
		options: FindOneOptions<T>
	): Promise<T> {
		const record = await this.repository.findOne(
			options
		);
		if (!record) {
			throw new NotFoundException(`The requested record was not found`);
		}
		return record;
	}

	/**
	 * Finds first entity that matches given conditions and options.
	 *
	 * @param conditions
	 * @param options
	 * @returns
	 */
	public async findOneByConditions(
		conditions: FindConditions<T>,
		options?: FindOneOptions<T>
	): Promise<T> {
		const record = await this.repository.findOne(
			conditions,
			options
		);
		if (!record) {
			throw new NotFoundException(`The requested record was not found`);
		}
		return record;
	}

	public async create(entity: DeepPartial<T>, ...options: any[]): Promise<T> {
		const obj = this.repository.create(entity);
		// createBy user
		const userId = RequestContext.currentUserId()
		if (userId) {
			// obj.createdById = userId
			if (!entity.createdById) {
				obj.createdBy = {
					id: userId
				}
			}

			obj.updatedBy = {
				id: userId
			}
		}
		
		try {
			// https://github.com/Microsoft/TypeScript/issues/21592
			return await this.repository.save(obj as any);
		} catch (err /*: WriteError*/) {
			throw new BadRequestException(err);
		}
	}

	protected async checkUpdateAuthorization(id: string | number | FindConditions<T>) {
		//
	}

	public async update(
		id: string | number | FindConditions<T>,
		partialEntity: QueryDeepPartialEntity<T>,
		...options: any[]
	): Promise<UpdateResult | T> {
		/**
		 * @todo 是不是应该用 切片 注解的方式处理权限检查问题 ?
		 */
		await this.checkUpdateAuthorization(id)
		const userId = RequestContext.currentUserId()
		try {
			// try if can import somehow the service and use its method
			if (typeof id === 'string') {
				partialEntity = {
					...partialEntity,
					// Ensure entity id in typeorm `UpdateEvent`
					id,
				}
			}
			return await this.repository.update(id, {
				...partialEntity,
				updatedById: userId ?? partialEntity.updatedById
			});
		} catch (err /*: WriteError*/) {
			throw new BadRequestException(err);
		}
	}

	public async delete(
		criteria: string | number | FindConditions<T>,
		...options: any[]
	): Promise<DeleteResult> {
		await this.checkUpdateAuthorization(criteria)
		try {
			return await this.repository.delete(criteria);
		} catch (err) {
			throw new NotFoundException(`The record was not found`, err);
		}
	}

	/**
	 * e.g., findOneById(id).pipe(map(entity => entity.id), entityNotFound())
	 */
	private entityNotFound() {
		return (stream$) =>
			stream$.pipe(
				mergeMap((signal) => {
					if (!signal) {
						return throwError(
							new NotFoundException(
								`The requested record was not found`
							)
						);
					}
					return of(signal);
				})
			);
	}
}
