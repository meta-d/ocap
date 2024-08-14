import { ICommand } from '@nestjs/cqrs'
import { ChatBILarkContext } from '../types'

export class ChatBICommand implements ICommand {
	static readonly type = '[ChatBI] Message'

	constructor(public readonly input: ChatBILarkContext) {}
}
