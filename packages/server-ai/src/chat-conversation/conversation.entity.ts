import { IChatConversation, IXpertRole } from '@metad/contracts'
import { TenantOrganizationBaseEntity } from '@metad/server-core'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsJSON, IsOptional, IsString } from 'class-validator'
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import { XpertRole } from '../core/entities/internal'

@Entity('chat_conversation')
export class ChatConversation extends TenantOrganizationBaseEntity implements IChatConversation {
	@ApiProperty({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	key: string

	@ApiProperty({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	title?: string

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	options?: IChatConversation['options']

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	messages?: any[]

	/*
    |--------------------------------------------------------------------------
    | @ManyToOne 
    |--------------------------------------------------------------------------
    */
	@ApiProperty({ type: () => XpertRole })
	@ManyToOne(() => XpertRole)
	@JoinColumn()
	role?: IXpertRole

	@ApiProperty({ type: () => String })
	@RelationId((it: ChatConversation) => it.role)
	@IsString()
	@Column({ nullable: true })
	roleId?: string
}
