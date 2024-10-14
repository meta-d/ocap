import { IKnowledgebase, IXpert, IXpertAgent, IXpertToolset, TAvatar, TXpertAgentOptions } from '@metad/contracts'
import { TenantOrganizationBaseEntity } from '@metad/server-core'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsJSON, IsOptional, IsString } from 'class-validator'
import { Column, Entity, Index, JoinColumn, OneToOne, RelationId } from 'typeorm'
import { Xpert } from '../core/entities/internal'

@Entity('xpert_agent')
export class XpertAgent extends TenantOrganizationBaseEntity implements IXpertAgent {
	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column()
	key: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ nullable: true, length: 100 })
	name?: string

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
    | @OneToOne
    |--------------------------------------------------------------------------
    */
	@ApiProperty({ type: () => Xpert })
	@OneToOne(() => Xpert, {
		nullable: true,
	})
	@JoinColumn()
	xpert: IXpert

	@ApiProperty({ type: () => String, readOnly: true })
	@RelationId((it: XpertAgent) => it.xpert)
	@IsString()
	@Index()
	@Column({ nullable: true })
	readonly xpertId: string

	/*
    |--------------------------------------------------------------------------
    | @ManyToOne
    |--------------------------------------------------------------------------
    */
	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	leaderKey?: string

	leader?: IXpertAgent
	// @OneToMany
	followers?: IXpertAgent[]

	/*
    |--------------------------------------------------------------------------
    | @ManyToMany 
    |--------------------------------------------------------------------------
    */
	// Xpert role's knowledgebases
	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@Column({ type: 'json', nullable: true })
	knowledgebaseIds?: string[]
	knowledgebases?: IKnowledgebase[]

	// Toolsets
	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@Column({ type: 'json', nullable: true })
	toolsetIds?: string[]
	toolsets?: IXpertToolset[]

	collaborators?: IXpert[]
	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@Column({ type: 'json', nullable: true })
	collaboratorNames?: string[]
}
