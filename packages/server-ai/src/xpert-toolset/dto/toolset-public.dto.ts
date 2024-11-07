import { IUser, TToolCredentials } from '@metad/contracts'
import { UserPublicDTO } from '@metad/server-core'
import { Exclude, Expose, Transform } from 'class-transformer'
import { XpertToolset } from '../xpert-toolset.entity'

@Expose()
export class ToolsetPublicDTO extends XpertToolset {
	@Exclude()
	declare options: Record<string, any>

	@Exclude()
	declare credentials?: TToolCredentials

	@Transform(({ value }) => (value ? new UserPublicDTO(value) : null))
	@Expose()
	createdBy?: IUser

	@Transform(({ value }) => (value ? new UserPublicDTO(value) : null))
	@Expose()
	updatedBy?: IUser

	constructor(partial: Partial<ToolsetPublicDTO>) {
		super()
		Object.assign(this, partial)
	}
}
