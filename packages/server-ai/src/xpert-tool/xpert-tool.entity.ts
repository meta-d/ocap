import { IXpertTool, IXpertToolset } from '@metad/contracts'
import { TenantOrganizationBaseEntity } from '@metad/server-core'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsJSON, IsOptional, IsString, IsBoolean } from 'class-validator'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { XpertToolset } from '../core/entities/internal'

@Entity('xpert_tool')
export class XpertTool extends TenantOrganizationBaseEntity implements IXpertTool {
	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column()
	name: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true, length: 500 })
	description?: string

	@ApiPropertyOptional({ type: () => Boolean })
	@IsBoolean()
	@Column({ nullable: true })
	enabled?: boolean

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	schema?: Record<string, any>

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	parameters?: Record<string, any>

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	options?: Record<string, any>

	/*
    |--------------------------------------------------------------------------
    | @ManyToOne 
    |--------------------------------------------------------------------------
    */

	// Xpert Toolset
	@ApiProperty({ type: () => XpertToolset })
	@ManyToOne(() => XpertToolset, (toolset) => toolset.tools, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	toolset?: IXpertToolset
}
