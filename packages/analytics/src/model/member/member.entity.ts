import { ApiProperty } from '@nestjs/swagger'
import { ISemanticModel } from '@metad/contracts'
import { TenantOrganizationBaseEntity } from '@metad/server-core'
import { IsNumber, IsString } from 'class-validator'
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import { SemanticModel } from '../model.entity'

/**
 * 维度成员表
 */
@Entity('semantic_model_member')
export class SemanticModelMember extends TenantOrganizationBaseEntity {
	@IsString()
	@Column({ length: 40 })
	entity: string

	@IsString()
	@Column({ length: 100 })
	dimension: string

	@IsString()
	@Column({ length: 100, nullable: true })
	hierarchy: string

	@IsString()
	@Column({ length: 100, nullable: true })
	level: string

	@IsString()
	@Column({ length: 40, nullable: true })
	language: string

	@IsString()
	@Column({ length: 100 })
	memberUniqueName: string
	// /**
	//  * Model
	//  */
	// @ApiProperty({ type: () => SemanticModel })
	// @ManyToOne(() => SemanticModel, (d) => d.cache, {
	// 	nullable: true,
	// 	onDelete: 'CASCADE',
	// })
	// @JoinColumn()
	// model?: ISemanticModel

	@ApiProperty({ type: () => String })
	// @RelationId((it: SemanticModelMember) => it.model)
	@IsString()
	@Column({ nullable: true })
	modelId?: string

	@IsString()
	@Column({ length: 100 })
	memberName: string

	@IsString()
	@Column({ length: 100, nullable: true })
	memberCaption: string

	@IsNumber()
	@Column('integer', { nullable: true })
	memberOrdinal: number

	@IsNumber()
	@Column('int2', { nullable: true })
	memberType: number

	@IsNumber()
	@Column('int2', { nullable: true })
	levelNumber: number

	@IsString()
	@Column({ length: 100, nullable: true })
	parentUniqueName: string
}
