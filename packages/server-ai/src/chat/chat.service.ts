import { Injectable, Type } from '@nestjs/common'
import { CommandBus, ICommand } from '@nestjs/cqrs'
import { ChatConversationAgent } from './chat-conversation'

@Injectable()
export class ChatService {
	private readonly conversations = new Map<string, ChatConversationAgent>()
	private commands: Map<string, Type<ICommand>> = new Map()

	constructor(private readonly commandBus: CommandBus) {}

	setConversation(id: string, conversation: ChatConversationAgent): void {
		this.conversations.set(id, conversation)
	}

	getConversation(id: string): ChatConversationAgent {
		return this.conversations.get(id)
	}

	registerCommand(name: string, command: Type<ICommand>) {
		this.commands.set(name, command)
	}

	async executeCommand(name: string, ...args: any[]) {
		const command = this.commands.get(name)
		if (!command) {
			throw new Error(`Command "${name}" not found`)
		}
		return await this.commandBus.execute(new command(...args))
	}
}
