import { SharedModule, TenantModule } from '@metad/server-core'
import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { CaslModule } from '../core/index'
import { StoryTemplateController } from './story-template.controller'
import { StoryTemplate } from './story-template.entity'
import { StoryTemplateService } from './story-template.service'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/story-template', module: StoryTemplateModule }]),
		TypeOrmModule.forFeature([StoryTemplate]),
		TenantModule,
		SharedModule,
		CqrsModule,
		CaslModule
	],
	controllers: [StoryTemplateController],
	providers: [StoryTemplateService],
	exports: [TypeOrmModule, StoryTemplateService]
})
export class StoryTemplateModule {}
