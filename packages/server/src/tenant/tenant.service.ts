import { Injectable } from '@nestjs/common';
import { CommandBus, EventPublisher } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { CrudService } from '../core/crud/crud.service';
import { Tenant } from './tenant.entity';
import {
	ITenantCreateInput,
	RolesEnum,
	IUser,
	FileStorageProviderEnum
} from '@metad/contracts';
import { UserService } from '../user/user.service';
import { RoleService } from './../role/role.service';
import { TenantRoleBulkCreateCommand } from '../role/commands/tenant-role-bulk-create.command';
import { TenantFeatureOrganizationCreateCommand } from './commands/tenant-feature-organization.create.command';
import { ImportRecordUpdateOrCreateCommand } from './../export-import/import-record';
import { User } from './../core/entities/internal';
import { TenantSettingSaveCommand } from './tenant-setting/commands';
import { TenantCreatedEvent } from './events';
import { DEFAULT_TENANT } from './default-tenants';

@Injectable()
export class TenantService extends CrudService<Tenant> {
	constructor(
		@InjectRepository(Tenant)
		private readonly tenantRepository: Repository<Tenant>,
		private readonly userService: UserService,
		private readonly roleService: RoleService,
		private readonly commandBus: CommandBus,
		private readonly publisher: EventPublisher,
	) {
		super(tenantRepository);
	}

	public async onboardTenant(
		entity: ITenantCreateInput,
		user: IUser
	): Promise<Tenant> {
		const { isImporting = false, sourceId = null } = entity;

		//1. Create Tenant of user.
		const tenant = await this.create(entity);

		//2. Create Role/Permissions to relative tenants.
		await this.commandBus.execute(
			new TenantRoleBulkCreateCommand([tenant])
		);

		//3. Create Enabled/Disabled features for relative tenants.
		await this.commandBus.execute(
			new TenantFeatureOrganizationCreateCommand([tenant])
		);

		//4. Create tenant default file stoage setting (LOCAL)
		const tenantId = tenant.id;
		await this.commandBus.execute(
			new TenantSettingSaveCommand({
					fileStorageProvider: FileStorageProviderEnum.LOCAL,
				},
				tenantId
			)
		);

		//4. Find SUPER_ADMIN role to relative tenant.
		const role = await this.roleService.findOne({
			tenant,
			name: RolesEnum.SUPER_ADMIN
		});

		//5. Assign tenant and role to user.
		await this.userService.update(user.id, {
			tenant: {
				id: tenant.id
			},
			role: {
				id: role.id
			}
		});

		//6. Create Import Records while migrating for relative tenant.
		if (isImporting && sourceId) {
			const { sourceId, userSourceId } = entity;
			await this.commandBus.execute(
				new ImportRecordUpdateOrCreateCommand({
					entityType: getManager().getRepository(Tenant).metadata.tableName,
					sourceId,
					destinationId: tenant.id,
					tenantId: tenant.id
				})
			);
			if (userSourceId) {
				await this.commandBus.execute(
					new ImportRecordUpdateOrCreateCommand({
						entityType: getManager().getRepository(User).metadata.tableName,
						sourceId: userSourceId,
						destinationId: user.id
					}, {
						tenantId: tenant.id
					})
				);
			}
		}

		return tenant;
	}

	public async generateDemo(id: string): Promise<Tenant> {
		const tenant = this.publisher.mergeObjectContext(await this.findOne(id))

		tenant.apply(new TenantCreatedEvent(tenant.id))
		tenant.commit()

		return tenant
	}

	public async getDefaultTenant() {
		return await this.findOne({
			where: {
				name: DEFAULT_TENANT
			}
		})
	}
}
