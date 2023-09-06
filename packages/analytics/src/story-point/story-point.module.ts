import { EmployeeModule, SharedModule, TenantModule } from '@metad/server-core'
import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { BusinessAreaModule } from '../business-area'
import { QueryHandlers } from './queries/handlers'
import { StoryPointController } from './story-point.controller'
import { StoryPoint } from './story-point.entity'
import { StoryPointService } from './story-point.service'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/story-point', module: StoryPointModule }]),
		forwardRef(() => TypeOrmModule.forFeature([StoryPoint])),
		TenantModule,
		SharedModule,
		CqrsModule,
		EmployeeModule,
		BusinessAreaModule
	],
	controllers: [StoryPointController],
	providers: [StoryPointService, ...QueryHandlers],
	exports: [TypeOrmModule, StoryPointService]
})
export class StoryPointModule {}
