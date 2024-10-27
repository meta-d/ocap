import {
	AiBusinessRole,
	ICopilotModel,
	IKnowledgebase,
	IUser,
	IXpert,
	IXpertAgent,
	IXpertToolset,
	IXpertWorkspace,
	TAvatar,
	TXpertOptions,
	TXpertTeamDraft,
	XpertTypeEnum
} from '@metad/contracts'
import { TenantOrganizationBaseEntity, User } from '@metad/server-core'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsDateString, IsJSON, IsOptional, IsString } from 'class-validator'
import {
	Column,
	DeleteDateColumn,
	Entity,
	Index,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	OneToOne,
	RelationId
} from 'typeorm'
import { CopilotModel, Knowledgebase, XpertAgent, XpertToolset, XpertWorkspace } from '../core/entities/internal'
import { WorkspaceBaseEntity } from '../core/entities/base.entity'

@Entity('xpert')
@Index(['tenantId', 'organizationId', 'type', 'slug', 'version', 'latest', 'deletedAt'], { unique: true })
export class Xpert extends WorkspaceBaseEntity implements IXpert {
	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ length: 100 })
	slug: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ length: 100 })
	name: AiBusinessRole | string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ length: 10 })
	type: XpertTypeEnum

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

	@ApiPropertyOptional({ type: () => Boolean })
	@IsBoolean()
	@IsOptional()
	@Column({ nullable: true })
	active?: boolean

	@ApiPropertyOptional({ type: () => Object })
	@IsString()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	avatar?: TAvatar

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	starters?: string[]

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	options?: TXpertOptions

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true, length: 20 })
	version?: string

	@ApiPropertyOptional({ type: () => Boolean })
	@IsBoolean()
	@IsOptional()
	@Column({ nullable: true })
	latest?: boolean

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	draft?: TXpertTeamDraft

	/*
    |--------------------------------------------------------------------------
    | @OneToOne
    |--------------------------------------------------------------------------
    */
	@ApiProperty({ type: () => XpertAgent })
	@OneToOne(() => XpertAgent, (agent: XpertAgent) => agent.xpert, {
		cascade: ["insert", "update", "remove", "soft-remove", "recover"]
	})
    agent?: IXpertAgent

	// Copilot Model
	@ApiProperty({ type: () => CopilotModel })
	@OneToOne(() => CopilotModel, {
		nullable: true,
		cascade: ["insert", "update", "remove", "soft-remove", "recover"]
	})
	@JoinColumn()
	copilotModel?: ICopilotModel

	@ApiProperty({ type: () => String })
	@RelationId((it: Xpert) => it.copilotModel)
	@IsString()
	@Column({ nullable: true })
	copilotModelId?: string

	/*
    |--------------------------------------------------------------------------
    | @OneToMany 
    |--------------------------------------------------------------------------
    */
	// AI Agents
	@ApiProperty({ type: () => XpertAgent, isArray: true })
	@OneToMany(() => XpertAgent, (agent) => agent.team)
	agents?: IXpertAgent[]

	/*
    |--------------------------------------------------------------------------
    | @ManyToMany 
    |--------------------------------------------------------------------------
    */
	// Executors
	@ManyToMany(() => Xpert, (x) => x.leaders, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	@JoinTable({
		name: 'xpert_to_executor',
		joinColumn: {
            name: 'leaderId',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'executorId',
            referencedColumnName: 'id',
        },
	})
	executors?: IXpert[]

	// Leaders
	@ManyToMany(() => Xpert, (x) => x.executors)
	leaders?: IXpert[]

	// Xpert role's knowledgebases
	@ManyToMany(() => Knowledgebase, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	@JoinTable({
		name: 'xpert_to_knowledgebase'
	})
	knowledgebases?: IKnowledgebase[]

	// Toolsets
	@ManyToMany(() => XpertToolset, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	@JoinTable({
		name: 'xpert_to_toolset'
	})
	toolsets?: IXpertToolset[]

	@ManyToMany(() => User, {
		onUpdate: 'CASCADE'
	})
	@JoinTable({
		name: 'xpert_to_manager'
	})
	managers?: IUser[]
}