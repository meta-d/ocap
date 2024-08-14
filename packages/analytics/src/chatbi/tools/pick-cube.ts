import { tool } from '@langchain/core/tools'
import { ISemanticModel } from '@metad/contracts'
import { markdownModelCube } from '@metad/ocap-core'
import { firstValueFrom, Subscriber } from 'rxjs'
import { z } from 'zod'
import { ChatBILarkMessage, ChatContext } from '../types'

export function createPickCubeTool(
	context: ChatContext,
	models: ISemanticModel[],
	subscriber: Subscriber<ChatBILarkMessage | string>
) {
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
								content: '请选择一个数据源：',
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
										content: '选择一个语义模型'
									},
									options: models.map((model) => ({
										text: {
											tag: 'plain_text',
											content: model.name
										},
										value: model.id
									}))
								}
							]
						}
					]
				}

				const modelId = await firstValueFrom(
					larkService.action({
						data: {
							receive_id: chatId,
							content: JSON.stringify(card),
							msg_type: 'interactive'
						},
						params: {
							receive_id_type: 'chat_id'
						}
					})
				)

				const model = models.find((item) => item.id === modelId)
				if (model) {
					const cubes = (<any>model.options.schema).cubes
					let cubeName = null
					if (cubes?.length > 1) {
						const cubeMessage = {
							config: {
								wide_screen_mode: true
							},
							elements: [
								{
									tag: 'div',
									text: {
										content: '请选择一个数据集：',
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
												content: '选择一个数据集'
											},
											options: (<any>model.options.schema).cubes.map((cube) => ({
												text: {
													tag: 'plain_text',
													content: cube.caption
												},
												value: cube.name
											}))
										}
									]
								}
							]
						}
						cubeName = await firstValueFrom(
							larkService.action({
								data: {
									receive_id: chatId,
									content: JSON.stringify(cubeMessage),
									msg_type: 'interactive'
								},
								params: {
									receive_id_type: 'chat_id'
								}
							})
						)
					} else {
						cubeName = cubes[0]?.name
					}
					if (!cubeName) {
						throw new Error(`未找到数据集，请结束对话`)
					}

					logger.debug(`User have picked the cube: ${cubeName}`)
					if (cubeName) {
						const entity = await firstValueFrom(dsCoreService.selectEntitySet(modelId, cubeName))
						if (entity?.entityType) {
							const prompt = markdownModelCube({ modelId, dataSource: modelId, cube: entity.entityType })
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
