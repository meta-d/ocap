import { AiProvider, ICopilot } from '@metad/contracts'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsBoolean, IsJSON } from 'class-validator'
import { AfterLoad, Column, Entity } from 'typeorm'
import { TenantOrganizationBaseEntity } from '../core/entities/internal'
import { Exclude, Expose } from 'class-transformer'
import { IsSecret, WrapSecrets } from '../core/decorators'

@Entity('copilot')
export class Copilot extends TenantOrganizationBaseEntity implements ICopilot {
    @ApiPropertyOptional({ type: () => Boolean })
	@IsBoolean()
	@IsOptional()
	@Column({ default: false })
    enabled?: boolean

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true, length: 10 })
	provider?: AiProvider

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Exclude({ toPlainOnly: true })
	@Column({ nullable: true })
	apiKey?: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	apiHost?: string

	@ApiPropertyOptional({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	defaultModel?: string

	@ApiPropertyOptional({ type: () => Boolean })
	@IsBoolean()
	@IsOptional()
	@Column({ nullable: true })
	showTokenizer?: boolean

	@ApiPropertyOptional({ type: () => Object })
	@IsJSON()
	@IsOptional()
	@Column({ type: 'json', nullable: true })
	options?: any

	@ApiProperty({ type: () => String })
	@Expose({ toPlainOnly: true, name: 'apiKey' })
	@IsSecret()
	secretKey?: string;

	@AfterLoad()
	afterLoadEntity?() {
		this.secretKey = this.apiKey;
		WrapSecrets(this, this);
	}
}
