import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { Employee } from './employee.entity';
import { UserModule } from './../user/user.module';
import { CommandHandlers } from './commands/handlers';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { AuthService } from '../auth/auth.service';
import { EmailService, EmailModule } from '../email';
import { UserOrganizationModule } from '../user-organization/user-organization.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
	imports: [
		RouterModule.register([{ path: '/employee', module: EmployeeModule }]),
		TypeOrmModule.forFeature([Employee]),
		EmailModule,
		UserOrganizationModule,
		CqrsModule,
		TenantModule,
		UserModule
	],
	controllers: [EmployeeController],
	providers: [
		EmployeeService,
		AuthService,
		EmailService,
		...CommandHandlers
	],
	exports: [TypeOrmModule, EmployeeService]
})
export class EmployeeModule {}
