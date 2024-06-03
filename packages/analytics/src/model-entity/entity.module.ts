import { SharedModule, TenantModule, UserModule } from '@metad/server-core'
import { BullModule } from '@nestjs/bull'
import { Module, forwardRef } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { SemanticModelMemberModule } from '../model-member'
import { CommandHandlers } from './commands/handlers'
import { ModelEntityController } from './entity.controller'
import { SemanticModelEntity } from './entity.entity'
import { SemanticModelEntityService } from './entity.service'
import { EntityMemberProcessor } from './entity-job.processor'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/semantic-model-entity', module: SemanticModelEntityModule }]),
		forwardRef(() => TypeOrmModule.forFeature([SemanticModelEntity])),
		TenantModule,
		SharedModule,
		CqrsModule,
		UserModule,

		SemanticModelMemberModule,

		BullModule.registerQueue({
			name: 'entity'
		})
	],
	controllers: [ModelEntityController],
	providers: [SemanticModelEntityService, EntityMemberProcessor, ...CommandHandlers],
	exports: [TypeOrmModule, SemanticModelEntityService]
})
export class SemanticModelEntityModule {}
