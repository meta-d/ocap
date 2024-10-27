import { ChatEventTypeEnum, CopilotChatMessage, IChatConversation, IXpert, XpertAgentExecutionEnum } from '@metad/contracts'
import { getErrorMessage, shortuuid } from '@metad/server-common'
import { Logger } from '@nestjs/common'
import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs'
import { Observable, tap } from 'rxjs'
import { XpertAgentChatCommand } from '../../../xpert-agent/commands'
import { XpertService } from '../../xpert.service'
import { XpertChatCommand } from '../chat.command'
import { FindChatConversationQuery } from '../../../chat-conversation/queries/index'
import { ChatConversationUpsertCommand } from '../../../chat-conversation/commands/index'
import {
	XpertAgentExecutionUpsertCommand
} from '../../../xpert-agent-execution/commands'

@CommandHandler(XpertChatCommand)
export class XpertChatHandler implements ICommandHandler<XpertChatCommand> {
	readonly #logger = new Logger(XpertChatHandler.name)

	constructor(
		private readonly xpertService: XpertService,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	public async execute(command: XpertChatCommand): Promise<Observable<MessageEvent>> {
		const { xpertId, input, options } = command
		const { conversationId } = options

		const timeStart = Date.now()

		const xpert = await this.xpertService.findOne(xpertId, { relations: ['agent'] })

		const userMessage: CopilotChatMessage = {
			id: shortuuid(),
			role: 'user',
			content: input,
		}
		let conversation: IChatConversation
		if (conversationId) {
			conversation = await this.queryBus.execute(
				new FindChatConversationQuery({id: conversationId}, ['execution'])
			)
			conversation.messages.push(userMessage)
			conversation = await this.commandBus.execute(
				new ChatConversationUpsertCommand(conversation)
			)
		} else {
			const execution = await this.commandBus.execute(
				new XpertAgentExecutionUpsertCommand({
					xpert: { id: xpert.id } as IXpert,
					agentKey: xpert.agent.key,
					inputs: {
						input
					},
					status: XpertAgentExecutionEnum.RUNNING
				})
			)
			conversation = await this.commandBus.execute(
				new ChatConversationUpsertCommand({
					xpert,
					title: input, // 改成 AI 自动总结标题
					options: {
						knowledgebases: options?.knowledgebases,
						toolsets: options?.toolsets
					},
					messages: [userMessage],
					execution
				})
			)
		}

		let status = XpertAgentExecutionEnum.SUCCEEDED
		let error = null
		let result = ''

		return (
			await this.commandBus.execute<XpertAgentChatCommand, Promise<Observable<MessageEvent>>>(
				new XpertAgentChatCommand(input, xpert.agent.key, xpert, {
					isDraft: options.isDraft,
					execution: conversation.execution
				})
			)
		).pipe(
			tap({
				next: (event) => {
					if (event.data.type === ChatEventTypeEnum.MESSAGE) {
						result += event.data.data
					}
				},
				error: (err) => {
					status = XpertAgentExecutionEnum.FAILED
					error = getErrorMessage(err)
				},
				finalize: async () => {
					try {
						const timeEnd = Date.now()

						// Record End time
						await this.commandBus.execute(
							new ChatConversationUpsertCommand({
								...conversation,
								messages: [
									...conversation.messages,
									{
										id: shortuuid(),
										role: 'assistant',
										content: result
									}
								],
								execution: {
									...conversation.execution,
									elapsedTime: timeEnd - timeStart,
									status,
									error,
									outputs: {
										output: result
									}
								},
							})
						)
					} catch (err) {
						//
					}
				}
			})
		)
	}
}
