import { ICopilotCheckpoint } from '@metad/contracts'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { Column, Entity } from 'typeorm'
import { TenantOrganizationBaseEntity } from '../core/entities/internal'

@Entity('copilot_checkpoint')
export class CopilotCheckpoint extends TenantOrganizationBaseEntity implements ICopilotCheckpoint {
	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ length: 100 })
	thread_id: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ length: 100 })
	checkpoint_id: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ nullable: true, length: 100 })
	parent_id?: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ length: 10000 })
	checkpoint: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ length: 10000 })
	metadata: string
}
