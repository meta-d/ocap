import { CacheModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TenantModule } from '../tenant'
import { LarkHooksController } from './lark.hooks.controller'
import { LarkMiddleware } from './lark.middleware'
import { LarkService } from './lark.service'
import { IntegrationModule } from '../integration/integration.module'
import { UserModule } from '../user'

@Module({
	imports: [CacheModule.register(), CqrsModule, TenantModule, UserModule, IntegrationModule],
	controllers: [LarkHooksController],
	providers: [LarkService],
	exports: [LarkService]
})
export class IntegrationLarkModule implements NestModule {
	/**
	 *
	 * @param consumer
	 */
	configure(consumer: MiddlewareConsumer) {
		// Apply middlewares to specific controllers
		consumer.apply(LarkMiddleware).forRoutes(LarkHooksController)
	}
}
