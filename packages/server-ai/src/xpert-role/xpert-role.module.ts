import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { TenantModule } from '@metad/server-core'
import { XpertRoleController } from './xpert-role.controller'
import { XpertRole } from './xpert-role.entity'
import { XpertRoleService } from './xpert-role.service'
import { CommandHandlers } from './commands/handlers/index'
import { KnowledgebaseModule } from '../knowledgebase'
import { QueryHandlers } from './queries/handlers'

@Module({
    imports: [
        RouterModule.forRoutes([{ path: '/xpert-role', module: XpertRoleModule }]),
        TypeOrmModule.forFeature([XpertRole]),
        TenantModule,
        CqrsModule,
        forwardRef(() => KnowledgebaseModule)
    ],
    controllers: [XpertRoleController],
    providers: [XpertRoleService, ...CommandHandlers, ...QueryHandlers],
    exports: [XpertRoleService]
})
export class XpertRoleModule { }
