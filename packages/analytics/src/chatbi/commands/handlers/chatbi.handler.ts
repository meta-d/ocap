import { HumanMessage, isAIMessage } from '@langchain/core/messages'
import { ToolInputParsingException } from '@langchain/core/tools'
import { END, GraphValueError } from '@langchain/langgraph'
import { AgentRecursionLimit } from '@metad/copilot'
import { isEntityType, markdownModelCube } from '@metad/ocap-core'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { firstValueFrom, from, Observable } from 'rxjs'
import { SemanticModelService } from '../../../model'
import { getSemanticModelKey, NgmDSCoreService } from '../../../model/ocap'
import { ChatBIService } from '../../chatbi.service'
import { ChatBICommand } from '../chatbi.command'
import { errorWithEndMessage } from '../../tools'

@CommandHandler(ChatBICommand)
export class ChatBIHandler implements ICommandHandler<ChatBICommand> {
	constructor(
		private readonly chatBIService: ChatBIService,
		private readonly modelService: SemanticModelService,
		private readonly dsCoreService: NgmDSCoreService
	) {}

	public async execute(command: ChatBICommand): Promise<Observable<any>> {
		const { input } = command
		const { larkService } = input

		const conversation = await this.chatBIService.getUserConversation(input)
		if (!conversation) {
			return from(
				larkService.errorMessage(input, new Error(`Can't found conversation for user: ${input.userId}`))
			)
		}
		// Cube context
		let context = 'Empty'
		const session = this.chatBIService.userSessions[conversation.userId]
		if (!conversation.context && conversation.chatType === 'p2p' && session.cubeName) {
			const tenantId = session.tenantId
			const organizationId = session.organizationId
			const modelId = session.modelId
			const cubeName = session.cubeName
			const model = await this.modelService.findOne(modelId, { where: { tenantId, organizationId } })
			// Get Data Source
			const modelKey = getSemanticModelKey(model)
			const modelDataSource = await this.dsCoreService._getDataSource(modelKey)
			// Get entity type context
			const entityType = await firstValueFrom(modelDataSource.selectEntityType(cubeName))
			if (!isEntityType(entityType)) {
				throw entityType
			}
			context = markdownModelCube({ modelId, dataSource: modelKey, cube: entityType })
			conversation.context = context
		}

		return new Observable((subscriber) => {
			;(async () => {
				const streamResults = await conversation.graph.stream(
					{
						messages: [new HumanMessage(input.text)],
						context
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
