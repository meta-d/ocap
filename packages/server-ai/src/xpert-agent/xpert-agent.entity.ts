import { IXpertToolset, IKnowledgebase, IXpertAgent, TXpertAgentOptions } from '@metad/contracts'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsJSON, IsOptional, IsString } from 'class-validator'
import { Column, Entity, Index, JoinTable, ManyToMany } from 'typeorm'
import { TenantOrganizationBaseEntity } from '@metad/server-core'
import { Knowledgebase, XpertToolset } from '../core/entities/internal'


@Entity('xpert_agent')
@Index(['tenantId', 'organizationId', 'name'], { unique: true })
export class XpertAgent extends TenantOrganizationBaseEntity implements IXpertAgent {
	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ length: 100 })
	name: string

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

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	avatar?: string

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	options?: TXpertAgentOptions

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
		name: 'xpert_agent_knowledgebase'
	})
	knowledgebases?: IKnowledgebase[]

	// Toolsets
	@ManyToMany(() => XpertToolset, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	@JoinTable({
		name: 'xpert_agent_toolset'
	})
	toolsets?: IXpertToolset[]
}
