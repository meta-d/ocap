import { TenantModule } from '@metad/server-core'
import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from '@nestjs/core'
import { SemanticModelModule } from '../model'
import { ProjectController } from './project.controller'
import { Project } from './project.entity'
import { ProjectService } from './project.service'
import { QueryHandlers } from './queries/handlers'

@Module({
	imports: [
		RouterModule.register([{ path: '/project', module: ProjectModule }]),
		TypeOrmModule.forFeature([Project]),
		TenantModule,
		CqrsModule,
		SemanticModelModule,
	],
	controllers: [ProjectController],
	providers: [ProjectService, ...QueryHandlers],
	exports: [TypeOrmModule, ProjectService]
})
export class ProjectModule {}
