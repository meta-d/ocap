import { EmployeeModule, SharedModule, TenantModule, UserModule } from '@metad/server-core'
import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { DataSourceAuthentication } from './authentication/authentication.entity'
import { DataSourceController } from './data-source.controller'
import { DataSource } from './data-source.entity'
import { DataSourceService } from './data-source.service'
import { EventHandlers } from './events/handlers'
import { CommandHandlers } from './commands/handlers'


@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/data-source', module: DataSourceModule }]),
		forwardRef(() =>
			TypeOrmModule.forFeature([DataSource, DataSourceAuthentication])
		),
		forwardRef(() => TenantModule),
		forwardRef(() => UserModule),
		SharedModule,
		CqrsModule,
		EmployeeModule
	],
	providers: [DataSourceService, ...EventHandlers, ...CommandHandlers],
	controllers: [DataSourceController],
	exports: [TypeOrmModule, DataSourceService]
})
export class DataSourceModule {}
