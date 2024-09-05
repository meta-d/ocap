import { Injectable } from '@nestjs/common'
import { ChatConversationAgent } from './chat-conversation'

@Injectable()
export class ChatService {
	private readonly conversations = new Map<string, ChatConversationAgent>()

	setConversation(id: string, conversation: ChatConversationAgent): void {
		this.conversations.set(id, conversation)
	}

	getConversation(id: string): ChatConversationAgent {
		return this.conversations.get(id)
	}
}
