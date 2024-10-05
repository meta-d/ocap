import { DatabaseModule, SharedModule, TenantModule } from '@metad/server-core'
import { BullModule } from '@nestjs/bull'
import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { SemanticModelModule } from '../model/model.module'
import { OcapModule } from '../model/ocap'
import { ModelMemberController } from './member.controller'
import { SemanticModelMember } from './member.entity'
import { MemberProcessor } from './member.processor'
import { SemanticModelMemberService } from './member.service'
import { CopilotModule } from '@metad/server-ai'

@Module({
	imports: [
		RouterModule.forRoutes([
			{ path: '/semantic-model-member', module: SemanticModelMemberModule }
		]),
		forwardRef(() => TypeOrmModule.forFeature([SemanticModelMember])),
		forwardRef(() => TenantModule),
		SharedModule,
		CqrsModule,
		forwardRef(() => SemanticModelModule),
		forwardRef(() => CopilotModule),
		DatabaseModule,

		BullModule.registerQueue({
			name: 'member',
		}),
		OcapModule,
	],
	controllers: [ModelMemberController],
	providers: [SemanticModelMemberService, MemberProcessor],
	exports: [SemanticModelMemberService, BullModule],
})
export class SemanticModelMemberModule {}
