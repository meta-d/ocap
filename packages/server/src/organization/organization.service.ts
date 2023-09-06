import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { Organization } from './organization.entity';
import { CommandBus } from '@nestjs/cqrs';
import { OrganizationDemoCommand } from './commands';

@Injectable()
export class OrganizationService extends TenantAwareCrudService<Organization> {
	constructor(
		@InjectRepository(Organization)
		private readonly organizationRepository: Repository<Organization>,

		private readonly commandBus: CommandBus
	) {
		super(organizationRepository);
	}

	/**
	 * Returns the organization based on the public link irrespective of the tenant.
	 */
	public async findByPublicLink(
		profile_link: string,
		select?: string,
		relation?: string
	): Promise<Organization> {
		const findObj: FindOneOptions<Organization> = {};

		if (select) {
			findObj['select'] = JSON.parse(select);
			findObj['relations'] = JSON.parse(relation);
		}

		return await this.organizationRepository.findOne(
			{ profile_link },
			findObj
		);
	}

	public async generateDemo(id: string) {
		const organization = await this.organizationRepository.findOne(id);

		await this.commandBus.execute(
			new OrganizationDemoCommand({
				id
			})
		)

		organization.createdDemo = true;
		return await this.organizationRepository.save(organization);
	}
}
