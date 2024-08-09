import { AiBusinessRole, ICopilotRole } from '@metad/contracts'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { Column, Entity } from 'typeorm'
import { TenantOrganizationBaseEntity } from '../core/entities/internal'

@Entity('copilot_role')
export class CopilotRole extends TenantOrganizationBaseEntity implements ICopilotRole {

    @ApiPropertyOptional({ type: () => String })
    @IsString()
    @Column({ length: 100 })
    name: AiBusinessRole | string

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
}
