import { AiProvider, ICopilotOrganization, IOrganization } from '@metad/contracts'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString } from 'class-validator'
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import { Organization, TenantBaseEntity, TenantOrganizationBaseEntity } from '@metad/server-core'

@Entity('copilot_organization')
export class CopilotOrganization extends TenantBaseEntity implements ICopilotOrganization {
	@ApiProperty({ type: () => Organization, readOnly: true })
	@ManyToOne(() => Organization, {
		nullable: true,
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	@IsOptional()
	organization?: IOrganization

	@ApiProperty({ type: () => String, readOnly: true })
	@RelationId((it: TenantOrganizationBaseEntity) => it.organization)
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	organizationId?: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true, length: 20 })
	provider?: AiProvider | string

	@ApiPropertyOptional({ type: () => Number })
	@IsNumber()
	@IsOptional()
	@Column({ nullable: true })
	tokenLimit?: number

	@ApiPropertyOptional({ type: () => Number })
	@IsNumber()
	@IsOptional()
	@Column({ nullable: true })
	tokenUsed?: number

	@ApiPropertyOptional({ type: () => Number })
	@IsNumber()
	@IsOptional()
	@Column({ nullable: true })
	tokenTotalUsed?: number
}
