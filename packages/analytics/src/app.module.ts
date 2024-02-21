import { EmployeeModule, OrganizationModule, TenantModule } from '@metad/server-core'
import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CqrsModule } from '@nestjs/cqrs'
import { ScheduleModule } from '@nestjs/schedule'
import { AgentModule } from './agent/index'
import { AppController } from './app.controller'
import { AnalyticsService } from './app.service'
import { ApprovalPolicyModule } from './approval-policy/approval-policy.module'
import { BusinessAreaUserModule } from './business-area-user/index'
import { BusinessAreaModule } from './business-area/index'
import { CollectionModule } from './collection/index'
import { CommentModule } from './comment'
import { CommandHandlers, EventHandlers } from './core/events/handlers'
import { DataSourceTypeModule } from './data-source-type/data-source-type.module'
import { DataSourceModule } from './data-source/data-source.module'
import { FavoriteModule } from './favorite/favorite.module'
import { FeedModule } from './feed/feed.module'
import { IndicatorMarketModule } from './indicator-market/indicator-market.module'
import { IndicatorModule } from './indicator/indicator.module'
import { InsightModule } from './insight/insight.module'
import { SemanticModelModule } from './model/model.module'
import { NotificationDestinationModule } from './notification-destination/index'
import { PermissionApprovalUserModule } from './permission-approval-user/permission-approval-user.module'
import { PermissionApprovalModule } from './permission-approval/permission-approval.module'
import { ProjectModule } from './project/index'
import { ModelQueryModule } from './query/index'
import { StoryPointModule } from './story-point/story-point.module'
import { StoryWidgetModule } from './story-widget/story-widget.module'
import { StoryModule } from './story/story.module'
import { SubscriptionModule } from './subscription/subscription.module'
import { VisitModule } from './visit/visit.module'
import { StoryTemplateModule } from './story-template/index'
import { ScreenshotModule } from './screenshot/screenshot.module'
import { CertificationModule } from './certification'
import { RedisModule } from './core/redis.module'
import { IndicatorAppModule } from './indicator-app/'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		ScheduleModule.forRoot(),
		CqrsModule,
		RedisModule,
		forwardRef(() => TenantModule),
		forwardRef(() => EmployeeModule),
		forwardRef(() => OrganizationModule),
		ProjectModule,
		CollectionModule,
		StoryModule,
		StoryTemplateModule,
		BusinessAreaModule,
		BusinessAreaUserModule,
		SemanticModelModule,
		DataSourceModule,
		DataSourceTypeModule,
		StoryPointModule,
		StoryWidgetModule,
		IndicatorModule,
		IndicatorAppModule,
		IndicatorMarketModule,
		NotificationDestinationModule,
		SubscriptionModule,
		InsightModule,
		AgentModule,
		FavoriteModule,
		ModelQueryModule,
		VisitModule,
		FeedModule,
		ApprovalPolicyModule,
		PermissionApprovalModule,
		PermissionApprovalUserModule,
		CommentModule,
		ScreenshotModule,
		CertificationModule
	],
	controllers: [AppController],
	providers: [AnalyticsService, ...EventHandlers, ...CommandHandlers]
})
export class AnalyticsModule {}
