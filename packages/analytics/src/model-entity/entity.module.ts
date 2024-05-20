import { SharedModule, TenantModule, UserModule } from '@metad/server-core'
import { Module, forwardRef } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { ModelEntityController } from './entity.controller'
import { SemanticModelEntity } from './entity.entity'
import { SemanticModelEntityService } from './entity.service'


@Module({
	imports: [
		RouterModule.forRoutes([
			{ path: '/semantic-model-entity', module: ModelEntityModule },
		]),
		forwardRef(() => TypeOrmModule.forFeature([ SemanticModelEntity ])),
		TenantModule,
		SharedModule,
		CqrsModule,
		UserModule,
	],
	controllers: [ModelEntityController],
	providers: [SemanticModelEntityService,],
	exports: [TypeOrmModule, SemanticModelEntityService]
})
export class ModelEntityModule {}
