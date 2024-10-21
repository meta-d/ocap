import { IXpert, IXpertAgent } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class XpertAgentExecuteCommand implements ICommand {
	static readonly type = '[Xpert Agent] Execute'

	constructor(
		public readonly input: string,
		public readonly agent: Partial<IXpertAgent>,
		public readonly xpert: Partial<IXpert>,
	) {}
}
