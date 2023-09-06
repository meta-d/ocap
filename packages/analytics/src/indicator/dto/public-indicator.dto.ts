import { IUser } from '@metad/contracts'
import { UserPublicDTO } from '@metad/server-core'
import { Exclude, Transform } from 'class-transformer'
import { Indicator } from '../indicator.entity'

export class IndicatorPublicDTO {
	@Exclude()
	options?: any

	@Transform(({ value }) => value && new UserPublicDTO(value))
	createdBy?: IUser

	constructor(partial: Partial<IndicatorPublicDTO | Indicator>) {
		Object.assign(this, partial)
	}
}
