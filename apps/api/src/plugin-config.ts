import {
	IPluginConfig,
	DEFAULT_GRAPHQL_API_PATH,
	DEFAULT_API_HOST,
	DEFAULT_API_BASE_URL
} from '@metad/server-common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

let assetPath;
let assetPublicPath;

console.log('Plugin Config -> __dirname: ' + __dirname);
console.log('Plugin Config -> process.cwd: ' + process.cwd());

// TODO: maybe better to use process.cwd() instead of __dirname?

// for Docker
if (__dirname.startsWith('/srv/pangolin')) {
	assetPath = '/srv/pangolin/assets';
	assetPublicPath = '/srv/pangolin/public';
} else {
	assetPath = path.join(
		path.resolve(
			__dirname,
			'../../../',
			...['apps', 'api', 'src', 'assets']
		)
	);

	assetPublicPath = path.join(
		path.resolve(__dirname, '../../../', ...['apps', 'api', 'public'])
	);
}

console.log('Plugin Config -> assetPath: ' + assetPath);
console.log('Plugin Config -> assetPublicPath: ' + assetPublicPath);

export const pluginConfig: IPluginConfig = {
	apiConfigOptions: {
		host: process.env.HOST || DEFAULT_API_HOST,
		port: process.env.PORT || 3333,
		baseUrl: process.env.API_BASE_URL || DEFAULT_API_BASE_URL,
		middleware: [],
		graphqlConfigOptions: {
			path: DEFAULT_GRAPHQL_API_PATH,
			playground: true,
			debug: true,
		}
	},
	dbConnectionOptions: {
		synchronize: true,
		...getDbConfig()
	},
	assetOptions: {
		assetPath: assetPath,
		assetPublicPath: assetPublicPath
	},
	// plugins: [KnowledgeBasePlugin, ChangelogPlugin]
};

function getDbConfig(): TypeOrmModuleOptions {
	const dbType =
		process.env.DB_TYPE && process.env.DB_TYPE === 'postgres'
			? 'postgres'
			: 'sqlite';

	switch (dbType) {
		case 'postgres': {
			const ssl = process.env.DB_SSL_MODE === 'true' ? true : undefined;

			return {
				type: dbType,
				host: process.env.DB_HOST || 'localhost',
				port: process.env.DB_PORT
					? parseInt(process.env.DB_PORT, 10)
					: 5432,
				database: process.env.DB_NAME || 'postgres',
				username: process.env.DB_USER || 'postgres',
				password: process.env.DB_PASS || 'root',
				logging: true,
				ssl: ssl,
				// Removes console logging, instead logs all queries in a file ormlogs.log
				logger: 'file',
				synchronize: true,
				uuidExtension: 'pgcrypto'
			};

			}
		case 'sqlite': {
			const sqlitePath =
				process.env.DB_PATH ||
				path.join(
					path.resolve('.', ...['apps', 'api', 'data']),
					'gauzy.sqlite3'
				);

			return {
				type: dbType,
				database: sqlitePath,
				logging: true,
				// Removes console logging, instead logs all queries in a file ormlogs.log
				logger: 'file',
				synchronize: true
			};
		}
			
	}
}
