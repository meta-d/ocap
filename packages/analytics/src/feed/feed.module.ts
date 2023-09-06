import { SharedModule, TenantModule } from '@metad/server-core'
import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { IndicatorModule } from '../indicator/indicator.module'
import { SemanticModelModule } from '../model/index'
import { StoryModule } from '../story/index'
import { FeedController } from './feed.controller'
import { Feed } from './feed.entity'
import { FeedService } from './feed.service'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/feeds', module: FeedModule }]),
		forwardRef(() => TypeOrmModule.forFeature([Feed])),
		forwardRef(() => TenantModule),
		SharedModule,
		CqrsModule,
		StoryModule,
		IndicatorModule,
		SemanticModelModule
	],
	providers: [FeedService],
	controllers: [FeedController]
})
export class FeedModule {}
