import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { TenantModule } from '../tenant'
import { UserModule } from '../user'
import { CopilotExample } from './copilot-example.entity'
import { CopilotExampleService } from './copilot-example.service'
import { CopilotExampleController } from './copilot-example.controller'
import { RedisModule } from '../core/redis.module'
import { CopilotModule } from '../copilot/copilot.module'
import { CommandHandlers } from './commands/handlers'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/copilot-example', module: CopilotExampleModule }]),
		TypeOrmModule.forFeature([ CopilotExample ]),
		TenantModule,
		CqrsModule,
		UserModule,
		CopilotModule,
		RedisModule
	],
	controllers: [CopilotExampleController],
	providers: [CopilotExampleService, ...CommandHandlers],
	exports: [CopilotExampleService]
})
export class CopilotExampleModule {}
