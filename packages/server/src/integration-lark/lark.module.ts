import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TenantModule } from '../tenant'
import { LarkService } from './lark.service'

@Module({
	imports: [CqrsModule, TenantModule],
	controllers: [],
	providers: [LarkService],
	exports: [LarkService]
})
export class IntegrationLarkModule {}
