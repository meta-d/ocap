import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { UserModule } from '../user/user.module'
import { TenantModule } from './../tenant/tenant.module'
import { CommandHandlers } from './commands/handlers'
import { RoleController } from './role.controller'
import { Role } from './role.entity'
import { RoleService } from './role.service'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/roles', module: RoleModule }]),
		forwardRef(() => TypeOrmModule.forFeature([Role])),
		forwardRef(() => TenantModule),
		forwardRef(() => UserModule),
		CqrsModule,
	],
	controllers: [RoleController],
	providers: [RoleService, ...CommandHandlers],
	exports: [TypeOrmModule, RoleService],
})
export class RoleModule {}
