import {
	ChatGatewayEvent,
	ChatGatewayMessage,
	ChatUserMessage,
	IChatConversation,
	IXpertRole,
	TOOLSETS
} from '@metad/contracts'
import { NgmLanguageEnum } from '@metad/copilot'
import { getErrorMessage, shortuuid } from '@metad/server-common'
import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs'
import { isNil } from 'lodash'
import { Observable } from 'rxjs'
import { FindXpertRoleQuery } from '../../../xpert-role'
import { ChatConversationCreateCommand, FindChatConversationQuery } from '../../../chat-conversation'
import { CopilotCheckpointSaver } from '../../../copilot-checkpoint/'
import { CopilotCheckLimitCommand } from '../../../copilot-user'
import { ChatConversationAgent } from '../../chat-conversation'
import { ChatService } from '../../chat.service'
import { ChatCommand } from '../chat.command'

@CommandHandler(ChatCommand)
export class ChatCommandHandler implements ICommandHandler<ChatCommand> {
	constructor(
		private readonly chatService: ChatService,
		private readonly copilotCheckpointSaver: CopilotCheckpointSaver,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	public async execute(command: ChatCommand): Promise<Observable<any>> {
		const { tenantId, organizationId, user, role, data } = command.input
		const { conversationId, id, language, content } = data as ChatUserMessage

		return new Observable<ChatGatewayMessage>((subscriber) => {
			(async () => {
				let chatConversation: IChatConversation = null
				if (isNil(conversationId)) {
					chatConversation = await this.commandBus.execute(
						new ChatConversationCreateCommand({
							entity: {
								tenantId,
								organizationId,
								createdById: user.id,
								roleId: role?.id,
								title: content, // 改成 AI 自动总结标题
								options: {
									knowledgebases: role?.knowledgebases,
									toolsets: role?.toolsets
								}
							}
						})
					)

					subscriber.next({
						event: ChatGatewayEvent.ConversationCreated,
						data: chatConversation
					})
				} else {
					chatConversation = await this.queryBus.execute(
						new FindChatConversationQuery({
							id: conversationId
						})
					)
				}

				let copilotRole: IXpertRole = null
				if (role?.id) {
					copilotRole = await this.queryBus.execute<FindXpertRoleQuery, IXpertRole>(
						new FindXpertRoleQuery({ tenantId, organizationId, id: role.id })
					)
				}

				if (!this.chatService.getConversation(chatConversation.id)) {
					await this.chatService.fetchCopilots(tenantId, organizationId)

					try {
						this.chatService.setConversation(
							chatConversation.id,
							new ChatConversationAgent(
								chatConversation,
								organizationId,
								user,
								this.copilotCheckpointSaver,
								this.chatService,
								this.commandBus,
								this.queryBus
							).createAgentGraph(copilotRole, TOOLSETS.filter((item) => role?.toolsets?.includes(item.id)))
						)
					} catch (error) {
						subscriber.next({
							event: ChatGatewayEvent.Error,
							data: {
								id: shortuuid(),
								role: 'info',
								error: getErrorMessage(error),
							}
						})
						subscriber.complete()
						return
					}
				}
				const conversation = this.chatService.getConversation(chatConversation.id)

				

				if (language) {
					conversation.updateState({ language: this.languagePrompt(language) })
				}
				if (copilotRole) {
					conversation.updateState({ role: copilotRole.prompt })
				}

				const answerId = shortuuid()
				// Response start event
				subscriber.next({
					event: ChatGatewayEvent.ChainStart,
					data: {
						id: answerId
					}
				})

				conversation.newMessage(answerId)
				// Update conversation messages
				await conversation.saveMessage({ id, content, role: 'user' })

				// Check token limit
				try {
					await this.commandBus.execute(new CopilotCheckLimitCommand({
						tenantId,
						organizationId,
						userId: user.id,
						copilot: conversation.copilot
					}))
				} catch(err) {
					await conversation.saveMessage({ id, content: err.message, role: 'assistant' })
					subscriber.next({
						event: ChatGatewayEvent.Error,
						data: {
							id: answerId,
							role: 'info',
							error: err.message,
						}
					})
					subscriber.complete()
					return
				}

				conversation
					.chat(content, answerId)
					.subscribe(subscriber)
			})()
		})
	}

	private languagePrompt(language: string) {
		return `Please answer in language ${Object.entries(NgmLanguageEnum).find((item) => item[1] === language)?.[0] ?? 'English'}`
	}
}
