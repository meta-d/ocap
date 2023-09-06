import { DynamicModule, forwardRef, Module } from '@nestjs/common';
import { TenantModule } from '../../tenant/tenant.module'
import { SeedDataService } from './seed-data.service';
import { DatabaseProviderModule } from '../database-provider.module';

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
				DatabaseProviderModule
			],
			exports: []
		} as DynamicModule;
	}
}
