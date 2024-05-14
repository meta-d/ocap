import { Module } from '@nestjs/common'
import { RouterModule } from 'nest-router'
import { CopilotModule } from '../copilot'
import { TenantModule } from '../tenant'
import { AIController } from './ai.controller'
import { AiService } from './ai.service'

@Module({
	imports: [
		RouterModule.forRoutes([
			{
				path: '/ai',
				module: AIModule
			}
		]),
		TenantModule,
		CopilotModule
	],
	controllers: [AIController],
	providers: [AiService]
})
export class AIModule {}
