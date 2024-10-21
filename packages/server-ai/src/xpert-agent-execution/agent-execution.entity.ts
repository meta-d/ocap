import { IXpert, IXpertAgent, IXpertAgentExecution } from '@metad/contracts'
import { TenantOrganizationBaseEntity } from '@metad/server-core'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { Column, Entity, JoinColumn, OneToOne, RelationId } from 'typeorm'
import { Xpert, XpertAgent } from '../core/entities/internal'

@Entity('xpert_agent_execution')
export class XpertAgentExecution extends TenantOrganizationBaseEntity implements IXpertAgentExecution {
	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true, length: 100 })
	title?: string

	/*
    |--------------------------------------------------------------------------
    | @ManyToOne
    |--------------------------------------------------------------------------
    */
	@ApiProperty({ type: () => XpertAgent })
	@OneToOne(() => XpertAgent, {
		nullable: true
	})
	@JoinColumn()
	agent: IXpertAgent

	@ApiProperty({ type: () => String, readOnly: true })
	@RelationId((it: XpertAgentExecution) => it.agent)
	@IsString()
	@Column({ nullable: true })
	readonly agentId: string

	@ApiProperty({ type: () => Xpert })
	@OneToOne(() => Xpert, {
		nullable: true
	})
	@JoinColumn()
	xpert: IXpert

	@ApiProperty({ type: () => String, readOnly: true })
	@RelationId((it: XpertAgentExecution) => it.xpert)
	@IsString()
	@Column({ nullable: true })
	readonly xpertId: string
}
