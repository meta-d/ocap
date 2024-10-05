import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { TenantModule } from '@metad/server-core'
import { CopilotOrganization } from './copilot-organization.entity'
import { CopilotOrganizationService } from './copilot-organization.service'
import { CopilotOrganizationController } from './copilot-organization.controller'

@Module({
    imports: [
        RouterModule.forRoutes([{ path: '/copilot-organization', module: CopilotOrganizationModule }]),
        TypeOrmModule.forFeature([CopilotOrganization]),
        TenantModule,
        CqrsModule,
    ],
    controllers: [CopilotOrganizationController],
    providers: [CopilotOrganizationService],
    exports: [CopilotOrganizationService]
})
export class CopilotOrganizationModule { }
