import { TenantModule } from '@metad/server-core'
import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { XpertToolsetController } from './xpert-toolset.controller'
import { XpertToolset } from './xpert-toolset.entity'
import { XpertToolsetService } from './xpert-toolset.service'
import { QueryHandlers } from './queries/handlers'
import { CopilotModule } from '../copilot'


@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/xpert-toolset', module: XpertToolsetModule }]),
		TypeOrmModule.forFeature([XpertToolset]),
		TenantModule,
		CqrsModule,

		CopilotModule
	],
	controllers: [XpertToolsetController],
	providers: [XpertToolsetService, ...QueryHandlers],
	exports: [XpertToolsetService]
})
export class XpertToolsetModule {}
