import { MiddlewareConsumer, Module, NestModule, OnApplicationShutdown } from '@nestjs/common';
import {
	AnalyticsModule,
} from '@metad/analytics'
import { SeederModule, ServerAppModule } from '@metad/server-core'
import { ConfigModule } from '@metad/server-config'
import { Logger } from '@metad/server-core';

@Module({
	imports: [
		ConfigModule,
		ServerAppModule,
		// AnalyticsModule,
    	// SeederModule
	],
	controllers: [],
	providers: []
})
export class BootstrapModule implements NestModule, OnApplicationShutdown {
	constructor() {}

	/**
	 *
	 * @param consumer
	 */
	configure(consumer: MiddlewareConsumer) {
		consumer.apply().forRoutes('*');
	}

	/**
	 *
	 * @param signal
	 */
	async onApplicationShutdown(signal: string) {
		if (signal) {
			Logger.log(`Received shutdown signal: ${signal}`);

			if (process.env.OTEL_ENABLED === 'true') {
				try {
					// Dynamically import the tracer module. We need it because otherwise tracer can initialize at different times etc
					const { default: tracer } = await import('./tracer');
					if (tracer) {
						await tracer.shutdown();
					}
				} catch (error) {
					console.error('Error terminating tracing', error);
				}
			}

			if (signal === 'SIGTERM') {
				Logger.log('SIGTERM shutting down. Please wait...');
			}
		}
	}
}
