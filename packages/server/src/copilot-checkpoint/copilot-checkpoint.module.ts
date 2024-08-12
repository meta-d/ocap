import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { DatabaseModule } from '../database'
import { TenantModule } from '../tenant'
import { CopilotCheckpointController } from './copilot-checkpoint.controller'
import { CopilotCheckpoint } from './copilot-checkpoint.entity'
import { CopilotCheckpointService } from './copilot-checkpoint.service'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/copilot-checkpoint', module: CopilotCheckpointModule }]),
		TypeOrmModule.forFeature([CopilotCheckpoint]),
		TenantModule,
		CqrsModule,
		DatabaseModule
	],
	controllers: [CopilotCheckpointController],
	providers: [CopilotCheckpointService],
	exports: [CopilotCheckpointService]
})
export class CopilotCheckpointModule {}
