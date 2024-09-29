import { tool } from '@langchain/core/tools'
import { isEntitySet, markdownModelCube } from '@metad/ocap-core'
import { getErrorMessage, race } from '@metad/server-common'
import { firstValueFrom, switchMap } from 'rxjs'
import { ChatBIModelService } from '../../chatbi-model/'
import { ChatContext, GetCubesContextSchema } from '../types'
import { ChatBIConversation } from '../conversation'

export function createCubeContextTool(context: ChatContext, modelService: ChatBIModelService) {
	const { logger, dsCoreService, conversation } = context
	return tool(
		async ({ cubes }): Promise<string> => {
			logger.debug(`Tool 'getCubeContext' params:`, JSON.stringify(cubes))
			try {
				// 限制总体超时时间
				return await race(ChatBIConversation.toolCallTimeout,
					(async () => {
						let context = ''
						for await (const item of cubes) {
							logger.debug(`  get context for (modelId=${item.modelId}, cube=${item.name})`)

							let entityType = await conversation.getCubeCache(item.modelId, item.name)
							if (!entityType) {
								const entitySet = await firstValueFrom(
									dsCoreService
										.getDataSource(item.modelId)
										.pipe(switchMap((dataSource) => dataSource.selectEntitySet(item.name)))
								)
								if (isEntitySet(entitySet)) {
									entityType = entitySet.entityType
									await conversation.setCubeCache(item.modelId, item.name, entityType)
								} else {
									logger.error(`  get context error: `, entitySet.message)
								}
							}
							if (entityType) {
								if (context) {
									context += '\n'
								}

								context += markdownModelCube({
									modelId: item.modelId,
									dataSource: item.modelId,
									cube: entityType
								})

								// Record visit
								await modelService.visit(item.modelId, item.name)
							}
						}

						return context
					})()
				)
			} catch (err) {
				const errorInfo = 'Error: ' + getErrorMessage(err)
				logger.debug(`Call getCubeContext: ` + errorInfo)
				return errorInfo
			}
		},
		{
			name: 'getCubeContext',
			description: 'Get the context info for cubes',
			schema: GetCubesContextSchema
		}
	)
}
