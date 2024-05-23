import { AiBusinessRole, AiProvider, ICopilotExample } from '@metad/contracts'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsJSON, IsOptional, IsString } from 'class-validator'
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

    @IsString()
	@Column({ length: 5000, nullable: true })
	input?: string


    @IsString()
	@Column({ length: 5000, nullable: true })
	output?: string

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	metadata?: any

    // For vector store
	@IsString()
	@Column({ length: 10000, nullable: true })
	content?: string

	@Column({ type: 'numeric', precision: 11, scale: 4, array: true, nullable: true })
	vector: number[]
}
