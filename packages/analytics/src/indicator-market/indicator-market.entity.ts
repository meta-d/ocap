import { ApiPropertyOptional } from '@nestjs/swagger'
import {
    IIndicatorMarket
} from '@metad/contracts'
import { TenantOrganizationBaseEntity } from '@metad/server-core'
import { IsJSON, IsOptional } from 'class-validator'
import {
    Column,
    Entity
} from 'typeorm'

@Entity('indicator_market')
export class IndicatorMarket extends TenantOrganizationBaseEntity implements IIndicatorMarket {

  @ApiPropertyOptional({ type: () => Object })
  @IsJSON()
  @IsOptional()
  @Column({ type: 'json', nullable: true })
  options?: any
}
