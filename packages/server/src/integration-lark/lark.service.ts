import * as lark from '@larksuiteoapi/node-sdk'
import { nonNullable } from '@metad/copilot'
import { environment } from '@metad/server-config'
import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { filter, Observable, Observer, Subject, Subscriber } from 'rxjs'
import { TenantService } from '../tenant'
import { LarkBotMenuCommand, LarkMessageCommand } from './commands'
import { ChatLarkContext, LarkMessage } from './types'

@Injectable()
export class LarkService {
	private readonly logger = new Logger(LarkService.name)

	private client = environment.larkConfig.appId
		? new lark.Client({
				appId: environment.larkConfig.appId,
				appSecret: environment.larkConfig.appSecret,
				appType: lark.AppType.SelfBuild,
				domain: lark.Domain.Feishu
			})
		: null

	private actions = new Map<string, Subject<any>>()
	private bot: {
		app_name: string
		avatar_url: string
		ip_white_list: string[]
		open_id: string
	} = null

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
					data.message.mentions?.some((mention) => mention.id.open_id === this.bot.open_id)
				)
			) {
				return true
			}

			// if (data.message.chat_type === 'p2p') {
			// 	const result = await this.interactiveMessage({ chatId } as ChatLarkContext, {
			// 		elements: []
			// 	})
			// 	return true
			// }

			this.logger.debug('im.message.receive_v1:')
			this.logger.debug(data)
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
			this.logger.debug('application.bot.menu_v6:')
			this.logger.debug(data)
			const organizationId = environment.larkConfig.organizationId
			const tenant = await this.tenantService.findOne({ id: environment.larkConfig.tenantId })
			const result = await this.commandBus.execute<LarkBotMenuCommand, Observable<any>>(
				new LarkBotMenuCommand({
					tenant,
					organizationId,
					message: data as any
				})
			)

			result.pipe(filter(nonNullable)).subscribe(async (message) => {
				await this.client.im.message.create(message)
			})

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
			this.logger.debug('card.action.trigger:')
			this.logger.debug(data)
			const messageId = data.context.open_message_id
			if (messageId) {
				if (this.actions.get(messageId)) {
					this.actions.get(messageId).next(data)
					return true
				} else {
					this.errorMessage({ chatId: data.context.open_chat_id }, new Error(`响应动作不存在或已超时！`))
				}
			}
			return false
		}
	})

	webhookEventDispatcher = lark.adaptExpress(this.eventDispatcher, { autoChallenge: true })

	constructor(
		private readonly tenantService: TenantService,
		private readonly commandBus: CommandBus
	) {
		if (this.client) {
			this.getBotInfo()
		}
	}

	async getBotInfo() {
		const res = await this.client.request({
			method: 'GET',
			url: 'https://open.feishu.cn/open-apis/bot/v3/info',
			data: {},
			params: {}
		})
		this.bot = res.bot
	}

	async createMessage(message: LarkMessage) {
		try {
			return await this.client.im.message.create(message)
		} catch (err) {
			this.logger.error(err)
		}
	}

	async patchMessage(payload?: {
		data: {
			content: string
		}
		path: {
			message_id: string
		}
	}) {
		try {
			return await this.client.im.message.patch(payload)
		} catch (err) {
			this.logger.error(err)
		}
	}

	async errorMessage({ chatId }: { chatId: string }, err: Error) {
		await this.createMessage({
			params: {
				receive_id_type: 'chat_id'
			},
			data: {
				receive_id: chatId,
				content: JSON.stringify({ text: `Error:` + err.message }),
				msg_type: 'text'
			}
		} as LarkMessage)
	}

	async textMessage(context: { chatId: string; messageId: string }, content: string) {
		const { chatId, messageId } = context
		if (messageId) {
			return await this.patchMessage({
				data: {
					content: JSON.stringify({ text: content })
				},
				path: {
					message_id: messageId
				}
			})
		}
		return await this.createMessage({
			params: {
				receive_id_type: 'chat_id'
			},
			data: {
				receive_id: chatId,
				content: JSON.stringify({ text: content }),
				msg_type: 'text'
			}
		} as LarkMessage)
	}

	async interactiveMessage(context: ChatLarkContext, data: any) {
		return await this.createMessage({
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

	async patchInteractiveMessage(messageId: string, data: any) {
		return await this.patchMessage({
			data: {
				content: JSON.stringify(data)
			},
			path: {
				message_id: messageId
			}
		})
	}

	async interactiveActionMessage(
		context: ChatLarkContext,
		data: any,
		subscriber?: Partial<Observer<any>> | ((value: any) => void)
	) {
		const message = await this.createMessage({
			params: {
				receive_id_type: 'chat_id'
			},
			data: {
				receive_id: context.chatId,
				content: JSON.stringify(data),
				msg_type: 'interactive'
			}
		} as LarkMessage)

		const messageId = message.data.message_id
		const response = new Subject<any>()
		this.actions.set(messageId, response)
		// 超时时间 10m
		setTimeout(
			() => {
				response.complete()
				this.actions.delete(messageId)
			},
			1000 * 60 * 10
		)
		response.subscribe(subscriber)
		return message
	}

	createAction(chatId: string, content: any) {
		return new Observable<{ value: any }>((subscriber: Subscriber<unknown>) => {
			this.client.im.message
				.create({
					data: {
						receive_id: chatId,
						content: JSON.stringify(content),
						msg_type: 'interactive'
					},
					params: {
						receive_id_type: 'chat_id'
					}
				})
				.then((res) => {
					const messageId = res.data.message_id
					const response = new Subject<any>()
					this.actions.set(messageId, response)
					// 超时时间 10m
					setTimeout(
						() => {
							response.complete()
							this.actions.delete(messageId)
						},
						1000 * 60 * 10
					)
					response.subscribe({
						next: (message) => {
							subscriber.next(message.action)
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

	patchAction(messageId: string, content: any) {
		return new Observable<{ value: any }>((subscriber: Subscriber<unknown>) => {
			this.client.im.message
				.patch({
					data: {
						content: JSON.stringify(content)
					},
					path: {
						message_id: messageId
					}
				})
				.then((res) => {
					const response = new Subject<any>()
					this.actions.set(messageId, response)
					// 超时时间 10m
					setTimeout(
						() => {
							response.complete()
							this.actions.delete(messageId)
						},
						1000 * 60 * 10
					)

					response.subscribe({
						next: (message) => {
							subscriber.next(message.action)
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
}
