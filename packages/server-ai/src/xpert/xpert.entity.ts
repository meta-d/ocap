import {
	AiBusinessRole,
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
import { Knowledgebase, XpertAgent, XpertToolset, XpertWorkspace } from '../core/entities/internal'

@Entity('xpert')
@Index(['tenantId', 'organizationId', 'type', 'slug', 'version', 'latest', 'deletedAt'], { unique: true })
export class Xpert extends TenantOrganizationBaseEntity implements IXpert {
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

	@ApiProperty({
		type: 'string',
		format: 'date-time',
		example: '2023-11-21T06:20:32.232Z'
	})
	@IsOptional()
	@Column({ nullable: true, type: 'timestamptz' })
	publishAt?: Date

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	draft?: TXpertTeamDraft

	// Soft Delete
	@ApiPropertyOptional({
		type: 'string',
		format: 'date-time',
		example: '2024-10-14T06:20:32.232Z'
	})
	@IsOptional()
	@IsDateString()
	// Soft delete column that records the date/time when the entity was soft-deleted
	@DeleteDateColumn() // Indicates that this column is used for soft-delete
	deletedAt?: Date

	/*
    |--------------------------------------------------------------------------
    | @OneToOne
    |--------------------------------------------------------------------------
    */
	@OneToOne(() => XpertAgent, (agent: XpertAgent) => agent.xpert, {
		cascade: ["insert", "update", "remove", "soft-remove", "recover"]
	})
    agent?: IXpertAgent

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
    | @ManyToOne
    |--------------------------------------------------------------------------
    */
	// belongs to Workspace
	@ApiProperty({ type: () => XpertWorkspace })
	@ManyToOne(() => XpertWorkspace, {
		nullable: true,
		onDelete: 'RESTRICT'
	})
	@JoinColumn()
	workspace?: IXpertWorkspace

	@ApiProperty({ type: () => String })
	@RelationId((it: Xpert) => it.workspace)
	@IsString()
	@Column({ nullable: true })
	workspaceId?: string

	/*
    |--------------------------------------------------------------------------
    | @ManyToMany 
    |--------------------------------------------------------------------------
    */
	// Executors
	@ManyToMany(() => Xpert, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	@JoinTable({
		name: 'xpert_to_executor'
	})
	executors?: IXpert[]

	// Leaders
	@ManyToMany(() => Xpert, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	@JoinTable({
		name: 'xpert_to_leader'
	})
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
