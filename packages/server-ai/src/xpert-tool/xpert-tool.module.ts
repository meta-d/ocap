import { TenantModule } from '@metad/server-core'
import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { XpertToolController } from './xpert-tool.controller'
import { XpertTool } from './xpert-tool.entity'
import { XpertToolService } from './xpert-tool.service'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/xpert-tool', module: XpertToolModule }]),
		TypeOrmModule.forFeature([XpertTool]),
		TenantModule,
		CqrsModule
	],
	controllers: [XpertToolController],
	providers: [XpertToolService],
	exports: [XpertToolService]
})
export class XpertToolModule {}
