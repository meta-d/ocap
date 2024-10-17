import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { TenantModule } from '@metad/server-core'
import { UserModule } from '@metad/server-core'
import { CopilotController } from './copilot.controller'
import { Copilot } from './copilot.entity'
import { QueryHandlers } from './queries/handlers/index'
import { CopilotService } from './copilot.service'
import { AIProvidersModule } from '../ai-model/index'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/copilot', module: CopilotModule }]),
		TypeOrmModule.forFeature([Copilot]),
		TenantModule,
		CqrsModule,
		UserModule,
		AIProvidersModule
	],
	controllers: [CopilotController],
	providers: [CopilotService, ...QueryHandlers],
	exports: [CopilotService]
})
export class CopilotModule {}
