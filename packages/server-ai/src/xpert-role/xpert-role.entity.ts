import { AiBusinessRole, IXpertRole, ICopilotToolset, IKnowledgebase, TXpertRoleOptions } from '@metad/contracts'
import { Optional } from '@nestjs/common'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsJSON, IsOptional, IsString } from 'class-validator'
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm'
import { TenantOrganizationBaseEntity } from '@metad/server-core'
import { Knowledgebase } from '../core/entities/internal'

@Entity('xpert_role')
export class XpertRole extends TenantOrganizationBaseEntity implements IXpertRole {
	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ length: 100 })
	name: AiBusinessRole | string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true, length: 100 })
	title?: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true, length: 100 })
	titleCN?: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true, length: 500 })
	description?: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true, length: 500 })
	prompt?: string

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	starters?: string[]

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Optional()
	@Column({ nullable: true })
	avatar?: string

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	toolsets?: ICopilotToolset[]

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	options?: TXpertRoleOptions

	/*
    |--------------------------------------------------------------------------
    | @ManyToMany 
    |--------------------------------------------------------------------------
    */

	// Xpert role's knowledgebases
	@ManyToMany(() => Knowledgebase, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	@JoinTable({
		name: 'xpert_role_knowledgebase'
	})
	knowledgebases?: IKnowledgebase[]
}
