import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EmployeeModule, SharedModule, TenantModule, CopilotModule } from '@metad/server-core'
import { BullModule } from '@nestjs/bull'
import { ModelMemberController } from './member.controller'
import { SemanticModelMember } from './member.entity'
import { SemanticModelMemberService } from './member.service'
import { SemanticModelModule } from '../model.module'
import { RedisModule } from '../../core'
import { MemberProcessor } from './member.processor'

@Module({
	imports: [
		forwardRef(() => TypeOrmModule.forFeature([SemanticModelMember])),
		forwardRef(() => TenantModule),
		SharedModule,
		CqrsModule,
		EmployeeModule,
		forwardRef(() => SemanticModelModule),
		forwardRef(() => CopilotModule),
		RedisModule,

		BullModule.registerQueue({
			name: 'member',
		  }),
	],
	controllers: [ModelMemberController],
	providers: [SemanticModelMemberService, MemberProcessor],
	exports: [SemanticModelMemberService],
})
export class SemanticModelMemberModule {}
