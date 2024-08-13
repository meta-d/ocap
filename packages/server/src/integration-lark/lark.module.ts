import { Module } from '@nestjs/common'
import { LarkService } from './lark.service'
import { CqrsModule } from '@nestjs/cqrs'

@Module({
	imports: [
		CqrsModule
	],
	controllers: [],
	providers: [LarkService],
	exports: [LarkService]
})
export class IntegrationLarkModule {}
