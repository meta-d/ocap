import { HumanMessage, isAIMessage } from '@langchain/core/messages'
import { ToolInputParsingException } from '@langchain/core/tools'
import { END, GraphValueError } from '@langchain/langgraph'
import { AgentRecursionLimit } from '@metad/copilot'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Observable } from 'rxjs'
import { ChatBIService } from '../../chatbi.service'
import { ChatBICommand } from '../chatbi.command'

@CommandHandler(ChatBICommand)
export class ChatBIHandler implements ICommandHandler<ChatBICommand> {
	constructor(private readonly chatBIService: ChatBIService) {}

	public async execute(command: ChatBICommand): Promise<any> {
		const { input } = command

		return new Observable((subscriber) => {
			;(async () => {
				const conversation = await this.chatBIService.getUserConversation(input, subscriber)
				if (!conversation) {
					return subscriber.error(`Can't found conversation for user: ${input.userId}`)
				}
				const streamResults = await conversation.graph.stream(
					{
						messages: [new HumanMessage(input.text)]
					},
					{
						configurable: {
							thread_id: input.conversationId
						},
						recursionLimit: AgentRecursionLimit,
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

							// if (content) {
							// 	//   if (this.verbose()) {
							// 	//     if (verboseContent) {
							// 	//       verboseContent += '\n\n<br>'
							// 	//     }
							// 	//     verboseContent += '✨ ' + content
							// 	//   } else {
							// 	verboseContent = content
							// 	//   }
							// }
							if (content) {
								verboseContent = content
								console.log(`content:`, verboseContent)
								subscriber.next(verboseContent)
							}
							// if (abort()) {
							//   break
							// }
						}
					}

					subscriber.complete()
				} catch (err: any) {
					console.error(err)
					if (err instanceof ToolInputParsingException) {
						//   this.#logger.error(err.message, err.output)
						// throw err
						subscriber.error(err)
					} else if (err instanceof GraphValueError) {
						end = true
					} else {
						subscriber.error(err)
					}
				}
			})()

			return () => {
				//
			}
		})
	}
}
