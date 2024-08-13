import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CommandHandlers } from './commands/handlers'

@Module({
	imports: [
		CqrsModule
	],
	controllers: [],
	providers: [...CommandHandlers],
	exports: []
})
export class IntegrationLarkModule {}
