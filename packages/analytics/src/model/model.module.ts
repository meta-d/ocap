import { EmployeeModule, SharedModule, TenantModule, UserModule } from '@metad/server-core'
import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { BusinessAreaModule } from '../business-area'
import { BusinessAreaUserModule } from '../business-area-user/index'
import { DataSourceModule } from '../data-source/data-source.module'
import { SemanticModelCacheModule } from './cache/cache.module'
import { CommandHandlers } from './commands/handlers'
import { EventHandlers } from './events/handlers'
import { SemanticModelMemberModule } from './member/member.module'
import { ModelController } from './model.controller'
import { SemanticModel } from './model.entity'
import { SemanticModelService } from './model.service'
import { QueryHandlers } from './queries/handlers'
import { SemanticModelRoleModule } from './role/role.module'
import { RedisModule } from '../core/redis.module'


@Module({
	imports: [
		RouterModule.forRoutes([
			{ path: '/semantic-model', module: SemanticModelModule },
			{ path: '/semantic-model-member', module: SemanticModelMemberModule }
		]),
		forwardRef(() => TypeOrmModule.forFeature([SemanticModel])),
		TenantModule,
		SharedModule,
		CqrsModule,
		UserModule,
		EmployeeModule,
		DataSourceModule,
		SemanticModelRoleModule,
		SemanticModelCacheModule,
		SemanticModelMemberModule,
		BusinessAreaUserModule,
		BusinessAreaModule,
		RedisModule
	],
	controllers: [ModelController],
	providers: [SemanticModelService, ...CommandHandlers, ...QueryHandlers, ...EventHandlers],
	exports: [TypeOrmModule, SemanticModelService]
})
export class SemanticModelModule {}
