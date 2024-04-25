import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@metad/server-config';
import { ConnectionEntityManager } from './connection-entity-manager';

/**
 * Import and provide base typeorm related classes.
 *
 * @module
 */
@Global()
@Module({
	imports: [
		/**
		 * Configuration for TypeORM database connection.
		 *
		 * @type {TypeOrmModuleOptions}
		 */
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			// Use useFactory, useClass, or useExisting
			useFactory: async (configService: ConfigService) => {
				console.log(configService.config)
				const { dbConnectionOptions } = configService.config;
				return dbConnectionOptions;
			}
		}),
	],
	providers: [ConnectionEntityManager],
	exports: [TypeOrmModule, ConnectionEntityManager]
})
export class DatabaseModule { }
