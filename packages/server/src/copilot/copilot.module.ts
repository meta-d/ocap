import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { TenantModule } from '../tenant'
import { UserModule } from '../user'
import { CopilotController } from './copilot.controller'
import { Copilot } from './copilot.entity'
import { CopilotService } from './copilot.service'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/copilot', module: CopilotModule }]),
		TypeOrmModule.forFeature([Copilot]),
		TenantModule,
		CqrsModule,
		UserModule
	],
	controllers: [CopilotController],
	providers: [CopilotService],
	exports: [CopilotService]
})
export class CopilotModule {}
