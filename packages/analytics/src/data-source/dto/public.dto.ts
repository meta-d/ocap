import { AuthenticationEnum, IDataSourceType, IUser } from '@metad/contracts'
import { UserPublicDTO } from '@metad/server-core'
import { Exclude, Expose, Transform } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { DataSource } from '../data-source.entity'

@Exclude()
export class DataSourcePublicDTO {
	@Expose()
	id: string

	@Expose()
	name: string

	@Expose()
	@IsOptional()
	type?: IDataSourceType

	@Expose()
	typeId?: string

	@Expose()
	@IsOptional()
	useLocalAgent?: boolean

	@Expose()
	@IsOptional()
	authType?: AuthenticationEnum

	@Expose()
	@IsOptional()
	createdAt?: Date

	@Expose()
	@IsOptional()
	updatedAt?: Date

	@Expose()
	@Transform(({ value }) => value && new UserPublicDTO(value))
	createdBy?: IUser

	constructor(partial: Partial<DataSource>) {
		Object.assign(this, partial)
	}
}
