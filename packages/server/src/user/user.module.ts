import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { CommandHandlers } from './commands/handlers';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SharedModule } from '../shared';
import { TenantModule } from '../tenant/tenant.module';
import { FactoryResetModule } from './factory-reset/factory-reset.module';
import { EventHandlers } from './events/handlers';
import { EmailVerification } from './email-verification/email-verification.entity';

@Module({
	imports: [
		RouterModule.register([
			{ path: '/user', module: UserModule }
		]),
		forwardRef(() => TypeOrmModule.forFeature([ User, EmailVerification ])),
		forwardRef(() => TenantModule),
		SharedModule,
		CqrsModule,
		FactoryResetModule,
	],
	controllers: [UserController],
	providers: [UserService, ...CommandHandlers, ...EventHandlers],
	exports: [TypeOrmModule, UserService]
})
export class UserModule {}
