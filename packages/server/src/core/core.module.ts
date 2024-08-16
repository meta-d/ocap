import {
	MiddlewareConsumer,
	Module,
	NestModule
} from '@nestjs/common';
import { RequestContextMiddleware, TenantDomainMiddleware } from './context';
import { FileStorageModule } from './file-storage';
import { DatabaseModule } from '../database/database.module';

@Module({
	imports: [
		DatabaseModule,
		// GraphqlApiModule,
		// GraphqlModule.registerAsync((configService: ConfigService) => ({
		// 	path: configService.graphqlConfigOptions.path,
		// 	playground: configService.graphqlConfigOptions.playground,
		// 	debug: configService.graphqlConfigOptions.debug,
		// 	cors: {
		// 		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		// 		credentials: true,
		// 		origin: '*',
		// 		allowedHeaders:
		// 			'Authorization, Language, Tenant-Id, X-Requested-With, X-Auth-Token, X-HTTP-Method-Override, Content-Type, Content-Language, Accept, Accept-Language, Observe'
		// 	},
		// 	typePaths: [
		// 		environment.isElectron
		// 			? path.join(
		// 					path.resolve(__dirname, '../../../../../../data/'),
		// 					'*.gql'
		// 			  )
		// 			: path.join(
		// 					path.resolve(__dirname, '../**/', 'schema'),
		// 					'*.gql'
		// 			  )
		// 	],
		// 	resolverModule: GraphqlApiModule
		// })) as DynamicModule,
		FileStorageModule
	],
	controllers: [],
	providers: []
})
export class CoreModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RequestContextMiddleware).forRoutes('*');
		consumer.apply(TenantDomainMiddleware).forRoutes('*');
	}
}
