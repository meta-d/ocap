import { IBusinessArea } from '@metad/contracts'
import { ICommand } from '@nestjs/cqrs'

export class BusinessAreaCreateCommand implements ICommand {
	static readonly type = '[Business Area] Create'

	constructor(public readonly input: IBusinessArea) {}
}
