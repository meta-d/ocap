import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from 'nest-router';
import { Employee } from './employee.entity';
import { UserModule } from './../user/user.module';
import { CommandHandlers } from './commands/handlers';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmailService, EmailModule } from '../email';
import { UserOrganizationModule } from '../user-organization/user-organization.module';
import { TenantModule } from '../tenant/tenant.module';
import { AuthModule } from '../auth';

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/employee', module: EmployeeModule }]),
		TypeOrmModule.forFeature([Employee]),
		EmailModule,
		UserOrganizationModule,
		CqrsModule,
		TenantModule,
		UserModule,
		AuthModule
	],
	controllers: [EmployeeController],
	providers: [
		EmployeeService,
		EmailService,
		...CommandHandlers
	],
	exports: [TypeOrmModule, EmployeeService]
})
export class EmployeeModule {}
