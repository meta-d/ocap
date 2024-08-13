import { Module } from '@nestjs/common'
import { CommandHandlers } from './commands/handlers'

@Module({
	imports: [],
	controllers: [],
	providers: [...CommandHandlers],
	exports: []
})
export class IntegrationLarkModule {}
