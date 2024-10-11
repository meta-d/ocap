import { AiBusinessRole, IXpertRole, IXpertToolset, IKnowledgebase, TXpertRoleOptions, IXpertWorkspace, TXpertRoleDraft, XpertRoleTypeEnum } from '@metad/contracts'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsJSON, IsOptional, IsString } from 'class-validator'
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, RelationId } from 'typeorm'
import { TenantOrganizationBaseEntity } from '@metad/server-core'
import { Knowledgebase, XpertToolset, XpertWorkspace } from '../core/entities/internal'


@Entity('xpert_role')
@Index(['tenantId', 'organizationId', 'type', 'name', 'version', 'latest'], { unique: true })
export class XpertRole extends TenantOrganizationBaseEntity implements IXpertRole {
	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	key: string

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

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	draft?: TXpertRoleDraft

	/*
    |--------------------------------------------------------------------------
    | @ManyToOne
    |--------------------------------------------------------------------------
    */
    // belongs to Workspace
	@ApiProperty({ type: () => XpertWorkspace })
	@ManyToOne(() => XpertWorkspace)
	@JoinColumn()
	workspace?: IXpertWorkspace

	@ApiProperty({ type: () => String })
	@RelationId((it: XpertRole) => it.workspace)
	@IsString()
	@Column({ nullable: true })
	workspaceId?: string
	
	// belongs to Team
	@ApiProperty({ type: () => XpertRole })
	@ManyToOne(() => XpertRole)
	@JoinColumn()
	teamRole?: IXpertRole

	@ApiProperty({ type: () => String })
	@RelationId((it: XpertRole) => it.teamRole)
	@IsString()
	@Column({ nullable: true })
	teamRoleId?: string

	/*
    |--------------------------------------------------------------------------
    | @ManyToMany 
    |--------------------------------------------------------------------------
    */
   	// Members
	@ManyToMany(() => XpertRole)
	@JoinTable({
		name: 'xpert_role_member'
	})
	members?: IXpertRole[]

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
}
