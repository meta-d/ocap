import { AuthModule, TenantSettingModule } from '@metad/server-core'
import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { AgentController } from './agent.controller'
import { EventsGateway } from './agent.gateway'

@Module({
	imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => TenantSettingModule),
    CqrsModule
  ],
	controllers: [AgentController],
	providers: [EventsGateway]
})
export class AgentModule {}
