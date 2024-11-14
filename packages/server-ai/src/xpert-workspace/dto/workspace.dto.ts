import { IUser } from '@metad/contracts'
import { UserPublicDTO } from '@metad/server-core'
import { Expose, Transform } from 'class-transformer'

@Expose()
export class XpertWorkspaceDTO {

	@Transform(({ value }) => value && value.map((user) => new UserPublicDTO(user)) )
	@Expose()
	members?: IUser[]

	constructor(partial: Partial<XpertWorkspaceDTO>) {
		Object.assign(this, partial)
	}
}
