import { TenantModule, UserModule } from '@metad/server-core'
import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { CopilotModelController } from './copilot-model.controller'
import { CopilotModel } from './copilot-model.entity'
import { CopilotModelService } from './copilot-model.service'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/copilot-model', module: CopilotModelModule }]),
		TypeOrmModule.forFeature([CopilotModel]),
		TenantModule,
		CqrsModule,
		UserModule
	],
	controllers: [CopilotModelController],
	providers: [CopilotModelService],
	exports: [CopilotModelService]
})
export class CopilotModelModule {}
