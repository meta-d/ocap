import { IUser } from '@metad/contracts'
import { Exclude, Expose } from 'class-transformer'

@Expose()
export class WorkspacePublicDTO {
	@Exclude()
	members?: IUser[]

	constructor(partial: Partial<WorkspacePublicDTO>) {
		Object.assign(this, partial)
	}
}
