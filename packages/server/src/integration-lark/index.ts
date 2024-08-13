import * as lark from '@larksuiteoapi/node-sdk'
import { environment } from '@metad/server-config'

const client = new lark.Client({
	appId: environment.larkConfig.appId,
	appSecret: environment.larkConfig.appSecret,
	appType: lark.AppType.SelfBuild,
	domain: lark.Domain.Feishu
})

const eventDispatcher = new lark.EventDispatcher({
    verificationToken: environment.larkConfig.verificationToken,
	encryptKey: environment.larkConfig.encryptKey,
	loggerLevel: lark.LoggerLevel.debug
}).register({
	'im.message.receive_v1': async (data) => {
		console.log(data)
		const chatId = data.message.chat_id

		const res = await client.im.message.create({
			params: {
				receive_id_type: 'chat_id'
			},
			data: {
				receive_id: chatId,
				content: JSON.stringify({ text: 'hello world' }),
				msg_type: 'text'
			}
		})
		return res
	}
})

export const larkWebhookEventDispatcher = lark.adaptExpress(eventDispatcher, {autoChallenge: true})
