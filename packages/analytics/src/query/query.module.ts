import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SharedModule, TenantModule } from '@metad/server-core'
import { ModelQueryService } from './query.service'
import { ModelQuery } from './query.entity'
import { RouterModule } from 'nest-router'
import { ModelQueryController } from './query.controller'

@Module({
	imports: [
		RouterModule.forRoutes([
			{ path: '/model-query', module: ModelQueryModule },
		]),
		forwardRef(() => TypeOrmModule.forFeature([ModelQuery])),
		forwardRef(() => TenantModule),
		SharedModule,
		CqrsModule,
	],
	controllers: [ModelQueryController],
	providers: [ModelQueryService],
	exports: [ModelQueryService],
})
export class ModelQueryModule {}
