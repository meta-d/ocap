import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { TenantModule } from '../tenant'
import { CopilotRoleController } from './copilot-role.controller'
import { CopilotRole } from './copilot-role.entity'
import { CopilotRoleService } from './copilot-role.service'
import { CommandHandlers } from './commands/handlers/index'

@Module({
    imports: [
        RouterModule.forRoutes([{ path: '/copilot-role', module: CopilotRoleModule }]),
        TypeOrmModule.forFeature([CopilotRole]),
        TenantModule,
        CqrsModule,
    ],
    controllers: [CopilotRoleController],
    providers: [CopilotRoleService, ...CommandHandlers],
    exports: [CopilotRoleService]
})
export class CopilotRoleModule { }
