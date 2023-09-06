import { ApiProperty } from '@nestjs/swagger'
import { ISemanticModel } from '@metad/contracts'
import { TenantBaseEntity } from '@metad/server-core'
import { IsString } from 'class-validator'
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import { SemanticModel } from '../model.entity'

/**
 * 语义模型数据缓存
 */
@Entity('semantic_model_cache')
export class SemanticModelCache extends TenantBaseEntity {

    @IsString()
	@Column({ length: 40 })
    key: string

	@IsString()
	@Column({ length: 40, nullable: true })
    language: string

	/**
	 * Model
	 */
	@ApiProperty({ type: () => SemanticModel })
	@ManyToOne(() => SemanticModel, (d) => d.cache, {
		nullable: true,
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	model?: ISemanticModel

	@ApiProperty({ type: () => String })
	// @RelationId((it: SemanticModelCache) => it.model)
	@IsString()
	@Column({ nullable: true })
	modelId?: string

	@IsString()
	@Column({ nullable: true })
    query?: string

    @IsString()
	@Column({ nullable: true })
    data?: string
}
