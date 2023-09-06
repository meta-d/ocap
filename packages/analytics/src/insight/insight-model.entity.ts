import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IBusinessArea,
  IInsightModel,
  ISemanticModel,
  ITag,
} from '@metad/contracts'
import { Tag, TenantBaseEntity } from '@metad/server-core'
import { IsJSON, IsOptional, IsString } from 'class-validator'
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId,
} from 'typeorm'
import { BusinessArea, SemanticModel } from '../core/entities/internal'


@Entity('insight_model')
export class InsightModel extends TenantBaseEntity implements IInsightModel {
  @ApiPropertyOptional({ type: () => String })
  @IsString()
  @IsOptional()
  @Column({ nullable: true })
  name?: string

  /**
   * BusinessArea
   */
  @ApiPropertyOptional({ type: () => BusinessArea })
  @ManyToOne(() => BusinessArea, (g) => g.insightModels)
  @JoinColumn()
  businessArea?: IBusinessArea

  @ApiProperty({ type: () => String })
  @RelationId((it: InsightModel) => it.businessArea)
  @IsString()
  @Column({ nullable: true })
  businessAreaId?: string

  // Indicator Tags
  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'tag_insight_model',
  })
  tags?: ITag[]

  /**
   * TODO Model
   */
  @ApiProperty({ type: () => SemanticModel })
  @ManyToOne(() => SemanticModel, (d) => d.insights, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  model?: ISemanticModel

  @ApiProperty({ type: () => String })
  @RelationId((it: InsightModel) => it.model)
  @IsString()
  @Column({ nullable: true })
  modelId?: string

  @ApiProperty({ type: () => String })
  @IsString()
  @IsOptional()
  @Column({ nullable: true })
  entity?: string

  @ApiPropertyOptional({ type: () => Object })
  @IsJSON()
  @IsOptional()
  @Column({ type: 'json', nullable: true })
  options?: any
}
