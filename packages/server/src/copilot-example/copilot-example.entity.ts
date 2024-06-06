import { AiBusinessRole, AiProvider, ICopilotExample } from '@metad/contracts'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { Column, Entity } from 'typeorm'
import { TenantBaseEntity } from '../core/entities/internal'

@Entity('copilot_example')
export class CopilotExample extends TenantBaseEntity implements ICopilotExample {
	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true, length: 20 })
	provider?: AiProvider

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true, length: 100 })
	role?: AiBusinessRole | string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true, length: 100 })
	command?: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ length: 5000, nullable: true })
	input?: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ length: 5000, nullable: true })
	output?: string

	@ApiPropertyOptional({ type: () => Boolean })
	@IsBoolean()
	@IsOptional()
	@Column({ default: false })
	vector?: boolean
}
