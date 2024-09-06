import { AiProviderRole, ICopilot } from '@metad/contracts'
import { Injectable, Type } from '@nestjs/common'
import { CommandBus, ICommand } from '@nestjs/cqrs'
import { CopilotService, ProviderRolePriority } from '../copilot'
import { ChatConversationAgent } from './chat-conversation'

@Injectable()
export class ChatService {
	private readonly conversations = new Map<string, ChatConversationAgent>()
	private commands: Map<string, Type<ICommand>> = new Map()
	private copilots = new Map<string, ICopilot[]>()

	constructor(
		private readonly copilotService: CopilotService,
		private readonly commandBus: CommandBus
	) {}

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

	async fetchCopilots(tenantId: string, organizationId: string) {
		this.copilots.set(
			`${tenantId}/${organizationId}`,
			await this.copilotService.findAllCopilots(tenantId, organizationId)
		)
	}

	findCopilot(tenantId: string, organizationId: string, role: AiProviderRole) {
		const copilots = this.copilots.get(`${tenantId}/${organizationId}`)
		let copilot: ICopilot = null
		for (const priorityRole of ProviderRolePriority.slice(ProviderRolePriority.indexOf(role))) {
			copilot = copilots.find((item) => item.role === priorityRole && item.enabled)
			if (copilot) {
				break
			}
		}

		if (!copilot) {
			throw new Error('copilot not found')
		}
		return copilot
	}
}
