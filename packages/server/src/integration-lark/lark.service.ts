import * as lark from '@larksuiteoapi/node-sdk'
import { nonNullable } from '@metad/copilot'
import { environment } from '@metad/server-config'
import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { filter, Observable, Subject, Subscriber } from 'rxjs'
import { TenantService } from '../tenant'
import { client } from './client'
import { LarkBotMenuCommand, LarkMessageCommand } from './commands'
import { ChatLarkContext, LarkMessage } from './types'

@Injectable()
export class LarkService {
	private readonly logger = new Logger(LarkService.name)

	private actions = new Map<string, Subject<any>>()

	eventDispatcher = new lark.EventDispatcher({
		verificationToken: environment.larkConfig.verificationToken,
		encryptKey: environment.larkConfig.encryptKey,
		loggerLevel: lark.LoggerLevel.debug
	}).register({
		'im.message.receive_v1': async (data) => {
			/**
			 * {
				schema: '2.0',
				event_id: 'b47ff4f15c86d5af497d75da76f90a84',
				token: '',
				create_time: '1723552741302',
				event_type: 'im.message.receive_v1',
				tenant_key: '',
				app_id: '',
				message: {
					chat_id: 'oc_3d8956dd83110e5e88f319613db55d94',
					chat_type: 'p2p' | 'group',
					content: '{"text":"HI"}',
					create_time: '1723552740951',
					message_id: 'om_d6c3ef63049d7a7d5963f02b72f5d5b8',
					message_type: 'text',
					update_time: '1723552740951'
				},
				sender: {
					sender_id: {
					open_id: '',
					union_id: '',
					user_id: '327b132g'
					},
					sender_type: 'user',
					tenant_key: ''
				},
				[Symbol(event-type)]: 'im.message.receive_v1'
			  }
			 */

			const tenant = await this.tenantService.findOne({ id: environment.larkConfig.tenantId })
			const organizationId = environment.larkConfig.organizationId
			const chatId = data.message.chat_id
			if (
				!(
					data.message.chat_type === 'p2p' ||
					data.message.mentions?.some((mention) => mention.id.open_id === environment.larkConfig.appOpenId)
				)
			) {
				return true
			}

			if (data.message.chat_type === 'p2p') {
				const card = {
					
					
						"header": {
							"template": "blue",
							"title": {
								"content": "表格组件（依赖端版本 7.4+)",
								"tag": "plain_text"
							}
						},
						"elements": [
							{
								"tag": "table",
								"page_size": 5,
								"row_height": "low",
								"header_style": {
									"text_align": "left",
									"text_size": "normal",
									"background_style": "none",
									"text_color": "grey",
									"bold": true,
									"lines": 1
								},
								"columns": [
									{
										"name": "customer_name",
										"display_name": "客户名称",
										"data_type": "text",
										"horizontal_align": "left",
										"width": "auto"
									},
									{
										"name": "customer_scale",
										"display_name": "客户规模",
										"data_type": "options",
										"horizontal_align": "left",
										"width": "auto"
									},
									{
										"name": "customer_arr",
										"display_name": "ARR(万元)",
										"data_type": "number",
										"format": {
											"symbol": "¥",
											"precision": 2,
											"seperator": true
										},
										"width": "auto"
									},
									{
										"name": "customer_poc",
										"display_name": "跟进人",
										"data_type": "persons",
										"horizontal_align": "left",
										"width": "auto"
									},
									{
										"name": "customer_date",
										"display_name": "签约日期",
										"data_type": "date",
										"date_format": "YYYY/MM/DD",
										"width": "auto"
									},
									{
										"name": "customer_link",
										"display_name": "相关链接",
										"data_type": "lark_md",
										"width": "auto"
									},
									{
											"name": "company_image",
											"display_name": "企业图片",
											"data_type": "markdown"
									}
								],
								"rows": [
									{
										"customer_name": "飞书科技",
										"customer_date": 1699341315000,
										"customer_scale": [
											{
												"text": "S2",
												"color": "blue"
											}
										],
										"customer_arr": 168,
										"customer_poc": [
											"ou_14a32f1a02e64944cf19207aa43abcef",
											"ou_e393cf9c22e6e617a4332210d2aabcef"
										],
										"customer_link": "[飞书科技](/document-mod/index?fullPath=/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)",
										"company_image": "![image.png](img_v3_02cc_bf88cdee-6650-4b39-987c-f8e87c3227fg)"
									},
									{
										"customer_name": "飞书科技_01",
										"customer_date": 1606101072000,
										"customer_scale": [
											{
												"text": "S1",
												"color": "red"
											}
										],
										"customer_arr": 168.23,
										"customer_poc": "ou_14a32f1a02e64944cf19207aa43abcef",
										"customer_link": "[飞书科技_01](/document-mod/index?fullPath=/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)",
										"company_image": "![image.png](img_v3_02cc_bf88cdee-6650-4b39-987c-f8e87c3227fg)"
									},
									{
										"customer_name": "飞书科技_02",
										"customer_date": 1606101072000,
										"customer_scale": [
											{
												"text": "S3",
												"color": "orange"
											}
										],
										"customer_arr": 168.23,
										"customer_poc": "ou_14a32f1a02e64944cf19207aa43abcef",
										"customer_link": "[飞书科技_02](/document-mod/index?fullPath=/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)",
										"company_image": "![image.png](img_v3_02cc_bf88cdee-6650-4b39-987c-f8e87c3227fg)"
									},
									{
										"customer_name": "飞书科技_03",
										"customer_date": 1606101072000,
										"customer_scale": [
											{
												"text": "S2",
												"color": "blue"
											}
										],
										"customer_arr": 168.23,
										"customer_poc": "ou_14a32f1a02e64944cf19207aa43abcef",
										"customer_link": "[飞书科技_03](/document-mod/index?fullPath=/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce)",
										"company_image": "![image.png](img_v3_02cc_bf88cdee-6650-4b39-987c-f8e87c3227fg)"
									}
								]
							}
						]
					}
					
				await this.interactiveMessage({ chatId } as ChatLarkContext, card)
				return true
			}

			console.log(data)
			const result = await this.commandBus.execute<LarkMessageCommand, Observable<any>>(
				new LarkMessageCommand({
					tenant,
					organizationId,
					message: data as any,
					chatId,
					chatType: data.message.chat_type,
					larkService: this
				})
			)
			result.subscribe({
				next: () => {
					//
				},
				error: () => {
					//
				}
			})

			return true
		},
		'application.bot.menu_v6': async (data) => {
			/**
			 * {
				schema: '2.0',
				event_id: '3632caaa3c0143c072b2149c5b58ae8f',
				token: '',
				create_time: '1723551863000',
				event_type: 'application.bot.menu_v6',
				tenant_key: '',
				app_id: 'cli_a6300438b435100b',
				event_key: 'select_cube_sales',
				operator: {
					operator_id: {
						open_id: '',
						union_id: '',
						user_id: '327b132g'
					}
				},
				timestamp: 1723551863,
				[Symbol(event-type)]: 'application.bot.menu_v6'
			  }
			 * 
			 */
			const { event_key } = data
			if (event_key.startsWith('select_cube:')) {
				const tenant = await this.tenantService.findOne({ id: environment.larkConfig.tenantId })
				console.log(data)
				const result = await this.commandBus.execute<LarkBotMenuCommand, Observable<any>>(
					new LarkBotMenuCommand({
						tenant,
						message: data as any
					})
				)

				result.pipe(filter(nonNullable)).subscribe(async (message) => {
					await client.im.message.create(message)
				})
			}

			return true
		},
		'card.action.trigger': async (data) => {
			/**
			 * {
				schema: '2.0',
				event_id: 'd972d3653c29ef5307e80e9a08cf099f',
				token: 'c-t',
				create_time: '1723625509226706',
				event_type: 'card.action.trigger',
				tenant_key: '',
				app_id: '',
				operator: {
					tenant_key: '',
					open_id: '',
					union_id: ''
				},
				action: { tag: 'select_static', option: '1' },
				host: 'im_message',
				context: {
					open_message_id: 'om_dd02538d5ecaf1b861c7d748deb3f189',
					open_chat_id: 'oc_f1a6cd3129de01656f2e9f4c3083b3a0'
				},
				[Symbol(event-type)]: 'card.action.trigger'
			  }
			 */
			console.log(data)
			const messageId = data.context.open_message_id
			if (messageId && this.actions.get(messageId)) {
				this.actions.get(messageId).next(data)
				return true
			}
			return false
		}
	})

	webhookEventDispatcher = lark.adaptExpress(this.eventDispatcher, { autoChallenge: true })

	constructor(
		private readonly tenantService: TenantService,
		private readonly commandBus: CommandBus
	) {}

	async createMessage(message: LarkMessage) {
		try {
			return await client.im.message.create(message)
		} catch(err) {
			this.logger.error(err)
		}
	}

	action(message: LarkMessage): Observable<string> {
		return new Observable<string>((subscriber: Subscriber<unknown>) => {
			client.im.message
				.create(message)
				.then((res) => {
					const response = new Subject<any>()
					this.actions.set(res.data.message_id, response)
					response.subscribe({
						next: (message) => {
							subscriber.next(message.action.option)
						},
						error: (err) => {
							subscriber.error(err)
						},
						complete: () => {
							subscriber.complete()
						}
					})
				})
				.catch((err) => subscriber.error(err))
		})
	}

	async errorMessage(context: ChatLarkContext, err: Error) {
		await this.createMessage({
			params: {
				receive_id_type: 'chat_id'
			},
			data: {
				receive_id: context.chatId,
				content: JSON.stringify({ text: `Error:` + err.message }),
				msg_type: 'text'
			}
		} as LarkMessage)
	}

	async textMessage(context: ChatLarkContext, content: string) {
		await this.createMessage({
			params: {
				receive_id_type: 'chat_id'
			},
			data: {
				receive_id: context.chatId,
				content: JSON.stringify({ text: content }),
				msg_type: 'text'
			}
		} as LarkMessage)
	}

	async interactiveMessage(context: ChatLarkContext, data: any) {
		await this.createMessage({
			params: {
				receive_id_type: 'chat_id'
			},
			data: {
				receive_id: context.chatId,
				content: JSON.stringify(data),
				msg_type: 'interactive'
			}
		} as LarkMessage)
	}

	async markdownMessage(context: ChatLarkContext, content: string) {
		await this.createMessage({
			params: {
				receive_id_type: 'chat_id'
			},
			data: {
				receive_id: context.chatId,
				content: JSON.stringify({
					elements: [
						{
							tag: 'markdown',
							content
						}
					]
				}),
				msg_type: 'interactive'
			}
		} as LarkMessage)
	}
}
