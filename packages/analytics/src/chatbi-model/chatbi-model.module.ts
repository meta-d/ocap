import { CopilotRoleModule } from '@metad/server-ai'
import { IntegrationModule, SharedModule, TenantModule } from '@metad/server-core'
import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { ChatBIModelController } from './chatbi-model.controller'
import { ChatBIModel } from './chatbi-model.entity'
import { ChatBIModelService } from './chatbi-model.service'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/chatbi-model', module: ChatBIModelModule }]),
		forwardRef(() => TypeOrmModule.forFeature([ChatBIModel])),
		forwardRef(() => TenantModule),
		SharedModule,
		CqrsModule,
		CopilotRoleModule,
		IntegrationModule,
	],
	controllers: [ChatBIModelController],
	providers: [ChatBIModelService],
	exports: [ChatBIModelService]
})
export class ChatBIModelModule {}
