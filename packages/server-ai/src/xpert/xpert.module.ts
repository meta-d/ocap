import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { TenantModule } from '@metad/server-core'
import { XpertController } from './xpert.controller'
import { Xpert } from './xpert.entity'
import { XpertService } from './xpert.service'
import { CommandHandlers } from './commands/handlers/index'
import { KnowledgebaseModule } from '../knowledgebase'
import { QueryHandlers } from './queries/handlers'

@Module({
    imports: [
        RouterModule.forRoutes([{ path: '/xpert', module: XpertModule }]),
        TypeOrmModule.forFeature([Xpert]),
        TenantModule,
        CqrsModule,
        forwardRef(() => KnowledgebaseModule)
    ],
    controllers: [XpertController],
    providers: [XpertService, ...CommandHandlers, ...QueryHandlers],
    exports: [XpertService]
})
export class XpertModule { }
