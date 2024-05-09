import { ISemanticModelMember } from '@metad/contracts'
import { TenantOrganizationBaseEntity } from '@metad/server-core'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'
import { Column, Entity } from 'typeorm'

/**
 * 维度成员表
 */
@Entity('semantic_model_member')
export class SemanticModelMember extends TenantOrganizationBaseEntity implements ISemanticModelMember {
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
	@Column({ length: 1000 })
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
	@Column({ length: 1000 })
	memberName: string

	@IsString()
	@Column({ length: 1000 })
	memberKey: string

	@IsString()
	@Column({ length: 1000, nullable: true })
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
	@Column({ length: 1000, nullable: true })
	parentUniqueName: string
}
