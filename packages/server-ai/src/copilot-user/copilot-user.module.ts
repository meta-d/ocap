import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { TenantModule } from '@metad/server-core'
import { CopilotUser } from './copilot-user.entity'
import { CopilotUserService } from './copilot-user.service'
import { CopilotUserController } from './copilot-user.controller'
import { CommandHandlers } from './commands/handlers'
import { CopilotOrganizationModule } from '../copilot-organization/index'

@Module({
    imports: [
        RouterModule.forRoutes([{ path: '/copilot-user', module: CopilotUserModule }]),
        TypeOrmModule.forFeature([CopilotUser]),
        TenantModule,
        CqrsModule,
        CopilotOrganizationModule
    ],
    controllers: [CopilotUserController],
    providers: [CopilotUserService, ...CommandHandlers],
    exports: [CopilotUserService]
})
export class CopilotUserModule { }
