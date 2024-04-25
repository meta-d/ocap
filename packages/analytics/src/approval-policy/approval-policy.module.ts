import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { RouterModule } from '@nestjs/core';
import { ApprovalPolicy } from './approval-policy.entity';
import { ApprovalPolicyController } from './approval-policy.controller';
import { ApprovalPolicyService } from './approval-policy.service';
import { CommandHandlers } from './commands/handlers';
import { TenantModule, UserModule } from '@metad/server-core';

@Module({
	imports: [
		RouterModule.register([
			{ path: '/approval-policy', module: ApprovalPolicyModule }
		]),
		TypeOrmModule.forFeature([
			ApprovalPolicy
		]),
		TenantModule,
		UserModule,
		CqrsModule
	],
	controllers: [
		ApprovalPolicyController
	],
	providers: [
		ApprovalPolicyService,
		...CommandHandlers
	],
	exports: [
		ApprovalPolicyService
	]
})
export class ApprovalPolicyModule {}
