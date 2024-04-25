import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { OrganizationProject } from './organization-project.entity';
import { OrganizationProjectController } from './organization-project.controller';
import { OrganizationProjectService } from './organization-project.service';
import { CommandHandlers } from './commands/handlers';
import { UserModule } from './../user/user.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
	imports: [
		RouterModule.register([
			{
				path: '/organization-projects',
				module: OrganizationProjectModule
			}
		]),
		TypeOrmModule.forFeature([OrganizationProject]),
		CqrsModule,
		TenantModule,
		UserModule
	],
	controllers: [OrganizationProjectController],
	providers: [OrganizationProjectService, ...CommandHandlers],
	exports: [
		TypeOrmModule,
		OrganizationProjectService
	]
})
export class OrganizationProjectModule {}
