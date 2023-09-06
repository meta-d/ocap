import {
	Entity,
	Column,
} from 'typeorm';
import { FileStorageProviderEnum, IScreenshot } from '@metad/contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { Exclude } from 'class-transformer';
import { TenantOrganizationBaseEntity } from '@metad/server-core';


@Entity('screenshot')
export class Screenshot extends TenantOrganizationBaseEntity
	implements IScreenshot {

	@ApiProperty({ type: () => String })
	@IsString()
	@Column()
	file: string;

	@ApiProperty({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ default: null, nullable: true })
	url?: string;

	@ApiProperty({ type: () => String })
	@IsString()
	@IsOptional()
	@Column({ default: null, nullable: true })
	thumb?: string;

	@ApiProperty({ type: () => 'timestamptz' })
	@IsNumber()
	@IsOptional()
	@Column({ default: null, nullable: true })
	recordedAt?: Date;

	@ApiProperty({ type: () => 'timestamptz' })
	@IsDateString()
	@Column({ nullable: true, default: null })
	deletedAt?: Date;

	@ApiProperty({ type: () => Number })
	@IsNumber()
	@IsOptional()
	@Column({ default: 0, nullable: true })
	size?: number;

	@ApiPropertyOptional({ type: () => String, enum: FileStorageProviderEnum })
	@Exclude({ toPlainOnly: true })
	@Column({
		type: 'simple-enum',
		nullable: true,
		enum: FileStorageProviderEnum
	})
	storageProvider?: FileStorageProviderEnum;

	fileUrl?: string;
	thumbUrl?: string;
	/*
    |--------------------------------------------------------------------------
    | @ManyToOne
    |--------------------------------------------------------------------------
    */

}
