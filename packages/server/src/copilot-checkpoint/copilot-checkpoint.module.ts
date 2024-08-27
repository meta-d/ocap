import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { DatabaseModule } from '../database'
import { TenantModule } from '../tenant'
import { CopilotCheckpointSaver } from './checkpoint-saver'
import { CopilotCheckpointController } from './copilot-checkpoint.controller'
import { CopilotCheckpoint } from './copilot-checkpoint.entity'
import { CopilotCheckpointService } from './copilot-checkpoint.service'
import { CopilotCheckpointWrites } from './writes/writes.entity'
import { CopilotCheckpointWritesService } from './writes/writes.service'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/copilot-checkpoint', module: CopilotCheckpointModule }]),
		TypeOrmModule.forFeature([CopilotCheckpoint, CopilotCheckpointWrites]),
		TenantModule,
		CqrsModule,
		DatabaseModule
	],
	controllers: [CopilotCheckpointController],
	providers: [CopilotCheckpointService, CopilotCheckpointSaver, CopilotCheckpointWritesService ],
	exports: [CopilotCheckpointService, CopilotCheckpointSaver]
})
export class CopilotCheckpointModule {}
