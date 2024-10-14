import { IXpertTool, IXpertToolset, TAvatar } from '@metad/contracts'
import { TenantOrganizationBaseEntity } from '@metad/server-core'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsJSON, IsOptional, IsString } from 'class-validator'
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm'
import { XpertTool } from '../core/entities/internal'

@Entity('xpert_toolset')
export class XpertToolset extends TenantOrganizationBaseEntity implements IXpertToolset {
	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column()
	name: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ nullable: true, length: 50 })
	type: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ nullable: true, length: 10 })
	category?: 'command' | string | null

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true, length: 500 })
	description?: string

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	avatar?: TAvatar

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	options?: Record<string, any>

	/*
    |--------------------------------------------------------------------------
    | @OneToMany 
    |--------------------------------------------------------------------------
    */

	// Xpert Tools
	@ApiProperty({ type: () => XpertTool })
	@OneToMany(() => XpertTool, (tool) => tool.toolset, {
		cascade: ['insert', 'update', 'remove', 'soft-remove', 'recover']
	})
	@JoinColumn()
	tools?: IXpertTool[]
}
