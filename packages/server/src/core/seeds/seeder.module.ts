import { DynamicModule, forwardRef, Module } from '@nestjs/common';
import { TenantModule } from '../../tenant/tenant.module'
import { SeedDataService } from './seed-data.service';
import { DatabaseModule } from '../../database';

/**
 * Import and provide seeder classes.
 *
 * @module
 */
@Module({
	imports: [
		forwardRef(() => TenantModule),
	],
	providers: [SeedDataService],
	exports: [SeedDataService]
})
export class SeederModule {
	static forPluings(): DynamicModule {
		return {
			module: SeederModule,
			providers: [],
			imports: [
				// ...getDynamicPluginsModules(),
				DatabaseModule
			],
			exports: []
		} as DynamicModule;
	}
}
