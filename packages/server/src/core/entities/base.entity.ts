import { AggregateRoot } from '@nestjs/cqrs'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
	BaseEntityModel as IBaseEntityModel,
	ID,
	IUser,
} from '@metad/contracts'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import {
	Column,
	CreateDateColumn,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	RelationId,
	UpdateDateColumn,
} from 'typeorm'
import { PrimaryKey, Property } from '@mikro-orm/core'
import { User } from './internal'

export abstract class Model extends AggregateRoot {
	constructor(input?: any) {
		super()
		if (input) {
			for (const [key, value] of Object.entries(input)) {
				;(this as any)[key] = value
			}
		}
	}
}

export abstract class BaseEntity extends Model implements IBaseEntityModel {
	// Primary key of UUID type
	@ApiPropertyOptional({ type: () => String })
	@PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' }) // For Mikro-ORM compatibility
	@PrimaryGeneratedColumn('uuid')
	id?: string;

	@ApiPropertyOptional({ type: () => String })
	@RelationId((t: BaseEntity) => t.createdBy)
	@IsString()
	@IsOptional()
	@Column({ type: 'uuid', nullable: true })
	createdById?: ID

	@ApiProperty({ type: () => User, readOnly: true })
	// @Transform(({ value }) => new UserPublicDTO(value))
	@ManyToOne(() => User, {
		nullable: true,
		onDelete: 'RESTRICT',
	})
	@JoinColumn()
	@IsOptional()
	createdBy?: IUser

	@ApiPropertyOptional({ type: () => String })
	@RelationId((t: BaseEntity) => t.updatedBy)
	@IsString()
	@IsOptional()
	@Column({ nullable: true })
	updatedById?: ID

	@ApiProperty({ type: () => User, readOnly: true })
	@ManyToOne(() => User, {
		nullable: true,
		onDelete: 'RESTRICT',
	})
	@JoinColumn()
	@IsOptional()
	updatedBy?: IUser

	// Date when the record was created
	@ApiPropertyOptional({
		type: 'string',
		format: 'date-time',
		example: '2018-11-21T06:20:32.232Z'
	})
	@CreateDateColumn() // TypeORM decorator for creation date
	@Property({
		// Automatically set the property value when entity gets created, executed during flush operation.
		onCreate: () => new Date(), // Set creation date on record creation
	})
	createdAt?: Date;

	// Date when the record was last updated
	@ApiPropertyOptional({
		type: 'string',
		format: 'date-time',
		example: '2018-11-21T06:20:32.232Z'
	})
	@UpdateDateColumn() // TypeORM decorator for update date
	@Property({
		// Automatically set the property value when entity gets created, executed during flush operation.
		onCreate: () => new Date(), // Set at record creation
		// Automatically update the property value every time entity gets updated, executed during flush operation.
		onUpdate: () => new Date(), // Update every time the entity is changed
	})
	updatedAt?: Date;

	// Indicates if record is active now
	@ApiPropertyOptional({
		type: Boolean,
		default: true
	})
	@IsOptional() // Field can be optional
	@IsBoolean() // Should be a boolean type
	// @ColumnIndex()
	// @MultiORMColumn({ nullable: true, default: true }) // TypeORM and Mikro-ORM compatibility
	isActive?: boolean;

	// Indicate if record is archived
	@ApiPropertyOptional({
		type: Boolean,
		default: false
	})
	@IsOptional() // Field can be optional
	@IsBoolean() // Should be a boolean type
	// @ColumnIndex()
	// @MultiORMColumn({ nullable: true, default: false }) // TypeORM and Mikro-ORM compatibility
	isArchived?: boolean;
}
