import { TenantModule } from '@metad/server-core'
import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { XpertAgentExecutionController } from './agent-execution.controller'
import { XpertAgentExecution } from './agent-execution.entity'
import { XpertAgentExecutionService } from './agent-execution.service'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/xpert-agent-execution', module: XpertAgentExecutionModule }]),
		TypeOrmModule.forFeature([XpertAgentExecution]),
		TenantModule,
		CqrsModule
	],
	controllers: [XpertAgentExecutionController],
	providers: [XpertAgentExecutionService],
	exports: [XpertAgentExecutionService]
})
export class XpertAgentExecutionModule {}
