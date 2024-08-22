import { tool } from '@langchain/core/tools'
import { IChatBIModel } from '@metad/contracts'
import { markdownModelCube } from '@metad/ocap-core'
import { firstValueFrom } from 'rxjs'
import { z } from 'zod'
import { ChatContext } from '../types'

export function createPickCubeTool(context: ChatContext, models: IChatBIModel[]) {
	const { logger, chatId, larkService, dsCoreService } = context
	return tool(
		async (answer): Promise<string> => {
			try {
				const card = {
					config: {
						wide_screen_mode: true
					},
					elements: [
						{
							tag: 'div',
							text: {
								content: '请选择一个模型：',
								tag: 'lark_md'
							}
						},
						{
							tag: 'action',
							actions: [
								{
									tag: 'select_static',
									placeholder: {
										tag: 'plain_text',
										content: '选择数据模型'
									},
									options: models.map((item) => ({
										text: {
											tag: 'plain_text',
											content: item.entityCaption
										},
										value: item.id
									}))
								}
							]
						}
					]
				}

				const chatModelId = await firstValueFrom(larkService.createAction(chatId, card))

				const chatModel = models.find((item) => item.id === chatModelId.value)
				if (chatModel) {
					const cubeName = chatModel.entity

					logger.debug(`User have picked the cube: ${cubeName}`)
					if (cubeName) {
						const entity = await firstValueFrom(dsCoreService.selectEntitySet(chatModel.modelId, cubeName))
						if (entity?.entityType) {
							const prompt = markdownModelCube({ modelId: chatModel.modelId, dataSource: chatModel.modelId, cube: entity.entityType })
							return prompt
						} else {
							logger.debug(`Can't got the type of entity: ${cubeName}`)
						}
					}
				}

				throw new Error(`未找到数据集，请结束对话`)
			} catch (err) {
				logger.error(err)
				return `Error: ${err.message}`
			}
		},
		{
			name: 'pickCube',
			description: 'Pick a cube when non cube context',
			schema: z.object({})
		}
	)
}
