import { forwardRef, Module } from '@nestjs/common'
import { AuthModule, TenantSettingModule } from '@metad/server-core'
import { AgentController } from './agent.controller'
import { EventsGateway } from './agent.gateway'

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => TenantSettingModule),
  ],
  controllers: [
    AgentController
  ],
  providers: [
    EventsGateway
  ],
})
export class AgentModule {}
