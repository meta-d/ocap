import { IChatBIConversation, ISemanticModel } from '@metad/contracts'
import { TenantOrganizationBaseEntity } from '@metad/server-core'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsJSON } from 'class-validator'
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import { SemanticModel, SemanticModelEntity } from '../core/entities/internal'

@Entity('chatbi_conversation')
export class ChatBIConversation extends TenantOrganizationBaseEntity implements IChatBIConversation {
    @ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column()
	key: string

    @ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	name?: string

    /**
	 * Model
	 */
	@ApiProperty({ type: () => SemanticModel })
	@ManyToOne(() => SemanticModel, (d) => d.entities, {
		nullable: true,
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	model?: ISemanticModel
	
	@ApiProperty({ type: () => String })
	@RelationId((it: SemanticModelEntity) => it.model)
	@IsString()
	@Column({ nullable: true })
	modelId?: string

    @ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	entity?: string

    @ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	command?: string

    @ApiPropertyOptional({ type: () => Object })
    @IsJSON()
    @IsOptional()
    @Column({ type: 'json', nullable: true })
    options?: any
}
