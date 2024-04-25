import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';

/**
 * Configuration options for handling assets in the application.
 */
export interface AssetConfigurationOptions {
	/**
	 * The path where assets are stored.
	 * @description Specifies the directory path where assets are stored.
	 */
	assetPath: string;

	/**
	 * The public path for accessing assets.
	 * @description Defines the public URL path for accessing assets.
	 */
	assetPublicPath: string;
}

export type IDBConnectionOptions = TypeOrmModuleOptions | MikroOrmModuleOptions;
