import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TenantOrganizationAwareCrudService } from '../core/crud'
import { CopilotRole } from './copilot-role.entity'

@Injectable()
export class CopilotRoleService extends TenantOrganizationAwareCrudService<CopilotRole> {
    readonly #logger = new Logger(CopilotRoleService.name)

    constructor(
        @InjectRepository(CopilotRole)
        repository: Repository<CopilotRole>,
        private readonly commandBus: CommandBus,
    ) {
        super(repository)
    }

}
