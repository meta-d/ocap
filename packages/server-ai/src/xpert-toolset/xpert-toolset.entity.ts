import { ITag, IXpertTool, IXpertToolset, TAvatar, XpertToolsetCategoryEnum } from '@metad/contracts'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsJSON, IsOptional, IsString } from 'class-validator'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany } from 'typeorm'
import { XpertTool } from '../core/entities/internal'
import { WorkspaceBaseEntity } from '../core/entities/base.entity'
import { Tag } from '@metad/server-core'

@Entity('xpert_toolset')
export class XpertToolset extends WorkspaceBaseEntity implements IXpertToolset {
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
	category?: 'command' | XpertToolsetCategoryEnum

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

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	credentials?: Record<string, any>

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	schema?: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	schemaType?: 'openapi_json' | 'openapi_yaml'

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

	/*
    |--------------------------------------------------------------------------
    | @ManyToMany 
    |--------------------------------------------------------------------------
    */
	// Toolset Tags
	@ManyToMany(() => Tag, {cascade: true, eager: true})
	@JoinTable({
	  name: 'tag_xpert_toolset',
	})
	tags?: ITag[]
}
