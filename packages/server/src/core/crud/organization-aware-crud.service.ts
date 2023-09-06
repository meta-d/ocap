import { DeepPartial, FindConditions, IsNull, ObjectLiteral, Repository, UpdateResult } from 'typeorm'
import { User } from '../../user/user.entity'
import { RequestContext } from '../context'
import { Employee, TenantOrganizationBaseEntity } from '../entities/internal'
import { ICrudService } from './icrud.service'
import { TenantAwareCrudService } from './tenant-aware-crud.service'
import { IBasePerTenantAndOrganizationEntityModel } from '@metad/contracts'
import { BadRequestException } from '@nestjs/common'

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
	protected constructor(
		protected readonly repository: Repository<T>,
		protected readonly employeeRepository?: Repository<Employee>
	) {
		super(repository)
	}

	protected findConditionsWithTenantByUser(
		user: User
	): FindConditions<T>[] | FindConditions<T> | ObjectLiteral | string {
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
		}
	}

	protected findConditionsWithTenant(
		user: User,
		where?: FindConditions<T> | ObjectLiteral | FindConditions<T>[]
	): FindConditions<T> | ObjectLiteral | FindConditions<T>[] {
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
				} as FindConditions<T>
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
			  } as FindConditions<T>)
			: ({
					tenant: {
						id: user.tenantId,
					},
					...organizationWhere,
			  } as ObjectLiteral)
	}

	public async create(entity: DeepPartial<T>, ...options: any[]): Promise<T> {
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
			return super.create(entityWithTenant, ...options)
		}
		return super.create(entity, ...options)
	}

	/**
	 * Soft Delete entity by id and current tenant id
	 *
	 * @param id entity id
	 * @returns
	 */
	async softDelete(id: string, options?: IBasePerTenantAndOrganizationEntityModel): Promise<UpdateResult> {
		const { organizationId } = options ?? {}
		try {
			await this.findOneByIdString(id, {
				where: {
					tenantId: RequestContext.currentTenantId(),
					organizationId: organizationId ?? RequestContext.getOrganizationId()
				}
			});
			return await this.repository.softDelete({
				id,
				tenantId: RequestContext.currentTenantId(),
				organizationId: organizationId ?? RequestContext.getOrganizationId()
			} as any);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

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
