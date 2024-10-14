import { IKnowledgebase, IXpert, IXpertAgent, IXpertToolset, TAvatar, TXpertAgentOptions } from '@metad/contracts'
import { TenantOrganizationBaseEntity } from '@metad/server-core'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsJSON, IsOptional, IsString } from 'class-validator'
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import { Xpert } from '../core/entities/internal'

@Entity('xpert_agent')
export class XpertAgent extends TenantOrganizationBaseEntity implements IXpertAgent {
	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column()
	key: string

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
	@Column({ nullable: true, length: 500 })
	description?: string

	@ApiPropertyOptional({ type: () => Object })
	@IsString()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	avatar?: TAvatar

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	prompt?: string

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
	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@Column({ type: 'json', nullable: true })
	knowledgebases?: IKnowledgebase[]

	// Toolsets
	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@Column({ type: 'json', nullable: true })
	toolsets?: IXpertToolset[]

	/*
    |--------------------------------------------------------------------------
    | @ManyToOne
    |--------------------------------------------------------------------------
    */
	@ApiProperty({ type: () => Xpert })
	@ManyToOne(() => Xpert, {
		nullable: true,
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	xpert?: IXpert

	@ApiProperty({ type: () => String })
	@RelationId((it: XpertAgent) => it.xpert)
	@IsString()
	@Column({ nullable: true })
	xpertId?: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	leaderKey?: string

	leader?: IXpertAgent
}
