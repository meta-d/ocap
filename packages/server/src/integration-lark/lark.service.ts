import * as lark from '@larksuiteoapi/node-sdk'
import { DEFAULT_TENANT } from '@metad/contracts'
import { nonNullable } from '@metad/copilot'
import { environment } from '@metad/server-config'
import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { filter, Observable, Subject, Subscriber } from 'rxjs'
import { TenantService } from '../tenant'
import { client } from './client'
import { LarkBotMenuCommand, LarkMessageCommand } from './commands'
import { ChatLarkContext, LarkMessage } from './types'

@Injectable()
export class LarkService {
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

			const tenant = await this.tenantService.findOne({ name: DEFAULT_TENANT })
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

			// if (data.message.chat_type === 'p2p') {
			// 	await this.interactiveMessage({chatId} as ChatLarkContext, {
			// 	  })
			// 	return true
			// }

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
				const tenant = await this.tenantService.findOne({ name: DEFAULT_TENANT })
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
		await client.im.message.create({
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
		await client.im.message.create({
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
		await client.im.message.create({
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
		await client.im.message.create({
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
