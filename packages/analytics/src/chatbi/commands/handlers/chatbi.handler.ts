import { HumanMessage, isAIMessage } from '@langchain/core/messages'
import { ToolInputParsingException } from '@langchain/core/tools'
import { END, GraphValueError } from '@langchain/langgraph'
import { AgentRecursionLimit } from '@metad/copilot'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { formatDocumentsAsString } from 'langchain/util/document'
import { from, Observable } from 'rxjs'
import { ChatBIService } from '../../chatbi.service'
import { errorWithEndMessage } from '../../tools'
import { ChatBICommand } from '../chatbi.command'

@CommandHandler(ChatBICommand)
export class ChatBIHandler implements ICommandHandler<ChatBICommand> {
	readonly commandName = 'chatbi'

	constructor(private readonly chatBIService: ChatBIService) {}

	public async execute(command: ChatBICommand): Promise<Observable<any>> {
		const { input } = command
		const { larkService } = input

		const conversation = await this.chatBIService.getUserConversation(input)
		if (!conversation) {
			return from(
				larkService.errorMessage(input, new Error(`Failed to create chat conversation for user: ${input.userId}`))
			)
		}
		// Cube context
		let context = null
		const session = this.chatBIService.userSessions[conversation.userId]
		if (!conversation.context && conversation.chatType === 'p2p' && session?.cubeName) {
			const modelId = session.modelId
			const cubeName = session.cubeName
			context = await conversation.switchContext(modelId, cubeName)
			conversation.context = context
		} else {
			context = conversation.context || 'Empty'
		}

		const content = await conversation.exampleFewShotPrompt.format({ input: input.text })
		const references = await conversation.copilotKnowledgeRetriever.pipe(formatDocumentsAsString).invoke(content)

		return new Observable((subscriber) => {
			;(async () => {
				const streamResults = await conversation.graph.stream(
					{
						input: input.text,
						messages: [new HumanMessage(content)],
						context,
						references
					},
					{
						configurable: {
							thread_id: conversation.threadId
						},
						recursionLimit: AgentRecursionLimit
						// debug: true
					}
				)
				let verboseContent = ''
				let end = false
				try {
					for await (const output of streamResults) {
						if (!output?.__end__) {
							let content = ''
							Object.entries(output).forEach(
								([key, value]: [
									string,
									{
										messages?: HumanMessage[]
										next?: string
										instructions?: string
										reasoning?: string
									}
								]) => {
									content += content ? '\n' : ''
									// Prioritize Routes
									if (value.next) {
										if (value.next === 'FINISH' || value.next === END) {
											end = true
										} else {
											content +=
												`<b>${key}</b>` +
												'\n\n<b>' +
												'Invoke' +
												`</b>: ${value.next}` +
												'\n\n<b>' +
												'Instructions' +
												`</b>: ${value.instructions || ''}` +
												'\n\n<b>' +
												'Reasoning' +
												`</b>: ${value.reasoning || ''}`
										}
									} else if (value.messages) {
										const _message = value.messages[0]
										if (isAIMessage(_message)) {
											if (_message.tool_calls?.length > 0) {
												//
											} else if (_message.content) {
												//   if (this.verbose()) {
												//     content += `<b>${key}</b>\n`
												//   }
												content += value.messages.map((m) => m.content).join('\n\n')
											}
										}
									}
								}
							)

							if (content) {
								verboseContent = content
								larkService.markdownMessage(input, verboseContent)
							}
							// if (abort()) {
							//   break
							// }
						}
					}
				} catch (err: any) {
					console.error(err)
					if (err instanceof ToolInputParsingException) {
						larkService.errorMessage(input, err)
					} else if (err instanceof GraphValueError) {
						end = true
					} else {
						// larkService.errorMessage(input, err)
						errorWithEndMessage(input, err.message, conversation)
					}
				}
			})()

			return () => {
				// when cancel
			}
		})
	}
}