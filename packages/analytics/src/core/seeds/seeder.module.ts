import { DatabaseModule, RedisModule, TenantModule } from '@metad/server-core'
import { DynamicModule, Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SeedDataService } from './seed-data.service'

/**
 * Import and provide seeder classes.
 *
 * @module
 */
@Module({
	imports: [
		forwardRef(() => TenantModule),
		ConfigModule.forRoot({
			isGlobal: true
		}),
		RedisModule
	],
	providers: [SeedDataService],
	exports: [SeedDataService]
})
export class SeederModule {
	static forPluings(): DynamicModule {
		return {
			module: SeederModule,
			providers: [],
			imports: [ DatabaseModule ],
			exports: []
		} as DynamicModule
	}
}
