import { ICommand } from '@nestjs/cqrs'
import { IXpertTool } from '@metad/contracts'

export class ToolInvokeCommand implements ICommand {
	static readonly type = '[Xpert Tool] Invoke'

	constructor(
		public readonly tool: IXpertTool
	) {}
}
