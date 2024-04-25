import { DeepPartial, FindManyOptions, FindOneOptions, FindOptionsWhere, IsNull, ObjectLiteral, Repository, UpdateResult } from 'typeorm'
import { IBasePerTenantAndOrganizationEntityModel, IUser } from '@metad/contracts'
import { BadRequestException } from '@nestjs/common'
import { User } from '../../user/user.entity'
import { RequestContext } from '../context'
import { TenantOrganizationBaseEntity } from '../entities/internal'
import { ICrudService } from './icrud.service'
import { TenantAwareCrudService } from './tenant-aware-crud.service'
import { MikroOrmBaseEntityRepository } from '../repository'

/**
 * This abstract class adds tenantId and organizationId to all query filters if a user is available in the current RequestContext
 * If a user is not available in RequestContext, then it behaves exactly the same as CrudService
 */
export abstract class TenantOrganizationAwareCrudService<
		T extends TenantOrganizationBaseEntity
	>
	extends TenantAwareCrudService<T>
	implements ICrudService<T>
{
	constructor(typeOrmRepository: Repository<T>, mikroOrmRepository?: MikroOrmBaseEntityRepository<T>) {
		super(typeOrmRepository, mikroOrmRepository);
	}

	/**
	 * @deprecated
	 */
	protected findConditionsWithUser(
		user: IUser,
		where?: FindManyOptions['where'] // FindConditions<T> | ObjectLiteral | FindConditions<T>[]
	): FindManyOptions['where'] {

		if (Array.isArray(where)) {
			return where.map((options) => ({
				...options,
				createdBy: {
					id: user.id
				}
			}))
		}

		if (typeof where === 'string') {
			return where
		}
		return where
			? {
				...where,
				createdBy: {
					id: user.id
				}
			  }
			: {
				createdBy: {
					id: user.id
				}
			  }
	}

	protected findConditionsWithTenantByUser(
		user: User
	): FindOptionsWhere<T> {
		const organizationId = RequestContext.getOrganizationId()
		const organizationWhere = organizationId
			? {
					organization: {
						id: organizationId,
					},
			  }
			: {
				organizationId: IsNull()
			}

		return {
			tenant: {
				id: user.tenantId,
			},
			...organizationWhere,
		} as FindOptionsWhere<T>;
	}

	protected findConditionsWithTenant(
		user: User,
		where?: FindOptionsWhere<T>[] | FindOptionsWhere<T>
	): FindOptionsWhere<T>[] | FindOptionsWhere<T> {
		const organizationId = RequestContext.getOrganizationId()

		if (Array.isArray(where)) {
			return where.map((options) => {
				options = {
					...options,
					organizationId: IsNull()
				}

				if (organizationId) {
					options = {
						...options,
						organization: {
							id: organizationId || null,
						},
					}
				}

				return {
					...options,
					tenant: {
						id: user.tenantId,
					},
				} as FindOptionsWhere<T>
			})
		}

		const organizationWhere = organizationId
			? {
					organization: {
						id: organizationId,
					},
			  }
			: {
				organizationId: IsNull()
			}

		return where
			? ({
					...where,
					tenant: {
						id: user.tenantId,
					},
					...organizationWhere,
			  } as FindOptionsWhere<T>)
			: ({
					tenant: {
						id: user.tenantId,
					},
					...organizationWhere,
			  } as FindOptionsWhere<T>)
	}

	public async create(entity: DeepPartial<T>): Promise<T> {
		const tenantId = RequestContext.currentTenantId()
		const user = RequestContext.currentUser()
		const organizationId = RequestContext.getOrganizationId()

		if (organizationId) {
			entity = {
				...entity,
				organization: { id: organizationId },
			}
		}

		if (tenantId) {
			const entityWithTenant = {
				...entity,
				tenant: { id: tenantId },
			}
			return super.create(entityWithTenant)
		}
		return super.create(entity)
	}

	// /**
	//  * Soft Delete entity by id and current tenant id
	//  *
	//  * @param id entity id
	//  * @returns
	//  */
	// async softDelete(criteria: string | number | FindOptionsWhere<T>,
	// 	options?: FindOneOptions<T>): Promise<UpdateResult> {
	// 	try {
	// 		await this.findOneByIdString(id, {
	// 			where: {
	// 				tenantId: RequestContext.currentTenantId(),
	// 				organizationId: organizationId ?? RequestContext.getOrganizationId()
	// 			}
	// 		});
	// 		return await this.repository.softDelete({
	// 			id,
	// 			tenantId: RequestContext.currentTenantId(),
	// 			organizationId: organizationId ?? RequestContext.getOrganizationId()
	// 		} as any);
	// 	} catch (error) {
	// 		throw new BadRequestException(error.message);
	// 	}
	// }

	/**
	 * Alternatively, You can recover the soft deleted rows by using the restore() method:
	 */
	async restoreSoftDelete(id: string, options?: IBasePerTenantAndOrganizationEntityModel): Promise<UpdateResult> {
		const { organizationId } = options ?? {}
		try {
			return await this.repository.restore({
				id,
				tenantId: RequestContext.currentTenantId(),
				organizationId: organizationId ?? RequestContext.getOrganizationId()
			} as any);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}
