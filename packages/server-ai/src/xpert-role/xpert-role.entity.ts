import { AiBusinessRole, IXpertRole, IXpertToolset, IKnowledgebase, TXpertRoleOptions, IXpertWorkspace, XpertRoleTypeEnum, TXpertTeamDraft, IUser } from '@metad/contracts'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsDateString, IsJSON, IsOptional, IsString } from 'class-validator'
import { Column, DeleteDateColumn, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId } from 'typeorm'
import { TenantOrganizationBaseEntity, User } from '@metad/server-core'
import { Knowledgebase, XpertToolset, XpertWorkspace } from '../core/entities/internal'


@Entity('xpert_role')
@Index(['tenantId', 'organizationId', 'type', 'name', 'version', 'latest', 'deletedAt'], { unique: true })
export class XpertRole extends TenantOrganizationBaseEntity implements IXpertRole {

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ length: 100 })
	name: AiBusinessRole | string
	
	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@Column({ length: 10 })
	type: XpertRoleTypeEnum

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
	@IsOptional()
	@Column({ nullable: true })
	avatar?: string

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	options?: TXpertRoleOptions

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true, length: 10 })
	version?: string

	@ApiPropertyOptional({ type: () => Boolean })
	@IsBoolean()
	@IsOptional()
	@Column({ nullable: true })
	latest?: boolean

	@ApiProperty({
		type: 'string',
		format: 'date-time',
		example: '2023-11-21T06:20:32.232Z',
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
	@RelationId((it: XpertRole) => it.workspace)
	@IsString()
	@Column({ nullable: true })
	workspaceId?: string
	
	// belongs to Team
	@ApiProperty({ type: () => XpertRole })
	@ManyToOne(() => XpertRole, {
		nullable: true,
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	teamRole?: IXpertRole

	@ApiProperty({ type: () => String })
	@RelationId((it: XpertRole) => it.teamRole)
	@IsString()
	@Column({ nullable: true })
	teamRoleId?: string

	// belongs to Leader
	@ApiProperty({ type: () => XpertRole })
	@ManyToOne(() => XpertRole, {
		nullable: true,
		onDelete: 'SET NULL'
	})
	@JoinColumn()
	leader?: IXpertRole

	@ApiProperty({ type: () => String })
	@RelationId((it: XpertRole) => it.leader)
	@IsString()
	@Column({ nullable: true })
	leaderId?: string

	/*
    |--------------------------------------------------------------------------
    | @OneToMany 
    |--------------------------------------------------------------------------
    */
	// Members of leader
	@ApiProperty({ type: () => XpertRole, isArray: true })
	@OneToMany(() => XpertRole, (member) => member.leader)
	members?: IXpertRole[]

	/*
    |--------------------------------------------------------------------------
    | @ManyToMany 
    |--------------------------------------------------------------------------
    */
   	// Followers
	@ManyToMany(() => XpertRole)
	@JoinTable({
		name: 'xpert_role_follower'
	})
	followers?: IXpertRole[]

	// Xpert role's knowledgebases
	@ManyToMany(() => Knowledgebase, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	@JoinTable({
		name: 'xpert_role_knowledgebase'
	})
	knowledgebases?: IKnowledgebase[]

	// Toolsets
	@ManyToMany(() => XpertToolset, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	@JoinTable({
		name: 'xpert_role_toolset'
	})
	toolsets?: IXpertToolset[]

	@ManyToMany(() => User, {
		onUpdate: 'CASCADE',
	})
	@JoinTable({
		name: 'xpert_role_manager'
	})
	managers?: IUser[]
}
