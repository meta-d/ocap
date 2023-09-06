import { Module } from '@nestjs/common'
import {
	AnalyticsModule,
} from '@metad/analytics'
import { SeederModule, ServerAppModule } from '@metad/server-core'

@Module({
	imports: [
		ServerAppModule,
		AnalyticsModule,
    	SeederModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
