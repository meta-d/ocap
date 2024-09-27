import { CacheModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { IntegrationModule } from '../integration/integration.module'
import { RoleModule } from '../role/role.module'
import { TenantModule } from '../tenant'
import { UserModule } from '../user'
import { LarkHooksController } from './lark.hooks.controller'
import { LarkMiddleware } from './lark.middleware'
import { LarkService } from './lark.service'
import { RouterModule } from 'nest-router'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/lark', module: IntegrationLarkModule }]),
		CacheModule.register(),
		CqrsModule,
		TenantModule,
		UserModule,
		RoleModule,
		IntegrationModule
	],
	controllers: [LarkHooksController],
	providers: [LarkService],
	exports: [LarkService]
})
export class IntegrationLarkModule {}
//  implements NestModule {
// 	/**
// 	 *
// 	 * @param consumer
// 	 */
// 	configure(consumer: MiddlewareConsumer) {
// 		// Apply middlewares to specific controllers
// 		consumer.apply(LarkMiddleware).forRoutes(LarkHooksController)
// 	}
// }
