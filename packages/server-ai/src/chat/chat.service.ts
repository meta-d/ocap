import { AiProviderRole, ICopilot } from '@metad/contracts'
import { Injectable } from '@nestjs/common'
import { CopilotService, ProviderRolePriority } from '../copilot'
import { XpertToolsetService } from '../xpert-toolset/xpert-toolset.service'
import { ChatConversationAgent } from './chat-conversation'

@Injectable()
export class ChatService {
	private readonly conversations = new Map<string, ChatConversationAgent>()
	private copilots = new Map<string, ICopilot[]>()

	constructor(
		private readonly copilotService: CopilotService,
		public readonly toolsetService: XpertToolsetService
	) {}

	setConversation(id: string, conversation: ChatConversationAgent): void {
		this.conversations.set(id, conversation)
	}

	getConversation(id: string): ChatConversationAgent {
		return this.conversations.get(id)
	}

	getCopilots(tenantId: string, organizationId: string) {
		return this.copilots.get(`${tenantId}/${organizationId}`)
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
