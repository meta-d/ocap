import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrganization, IUser, IUserOrganization, RolesEnum } from '@metad/contracts';
import { TenantAwareCrudService } from './../core/crud';
import { Organization, UserOrganization } from './../core/entities/internal';

@Injectable()
export class UserOrganizationService extends TenantAwareCrudService<UserOrganization> {
	constructor(
		@InjectRepository(UserOrganization)
		private readonly userOrganizationRepository: Repository<UserOrganization>,

		@InjectRepository(Organization)
		private readonly organizationRepository: Repository<Organization>
	) {
		super(userOrganizationRepository);
	}

	/**
	 * Adds a user to all organizations within a specific tenant.
	 *
	 * @param userId The unique identifier of the user to be added to the organizations.
	 * @param tenantId The unique identifier of the tenant whose organizations the user will be added to.
	 * @returns A promise that resolves to an array of IUserOrganization, where each element represents the user's association with an organization in the tenant.
	 */
	async addUserToOrganization(
		user: IUser,
		organizationId: IOrganization['id']
	): Promise<IUserOrganization | IUserOrganization[]> {
		/** If role is SUPER_ADMIN, add user to all organizations in the tenant */
		if (user.role.name === RolesEnum.SUPER_ADMIN) {
			return await this._addUserToAllOrganizations(user.id, user.tenantId);
		}

		const entity: IUserOrganization = new UserOrganization();
		entity.organizationId = organizationId;
		entity.tenantId = user.tenantId;
		entity.userId = user.id;
		return await this.repository.save(entity)
	}

	private async _addUserToAllOrganizations(
		userId: string,
		tenantId: string
	): Promise<IUserOrganization[]> {
		const organizations = await this.organizationRepository.find({
			select: ['id'],
			where: { tenant: { id: tenantId } },
			relations: ['tenant']
		});
		const entities: IUserOrganization[] = [];

		for await (const organization of organizations) {
			const entity: IUserOrganization = new UserOrganization();
			entity.organizationId = organization.id;
			entity.tenantId = tenantId;
			entity.userId = userId;
			entities.push(entity);
		}
		return await this.repository.save(entities);
	}
}
