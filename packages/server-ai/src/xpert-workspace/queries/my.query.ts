import { IQuery } from '@nestjs/cqrs'
import { IUser } from '@metad/contracts'
import { FindManyOptions } from 'typeorm'
import { XpertWorkspace } from '../workspace.entity'

/**
 */
export class MyXpertWorkspaceQuery implements IQuery {
	static readonly type = '[Xpert Workspace] My'

	constructor(
		public readonly user: IUser,
		public readonly input: Pick<FindManyOptions<XpertWorkspace>, 'relations'> &
			Pick<FindManyOptions<XpertWorkspace>, 'where'>
	) {}
}
