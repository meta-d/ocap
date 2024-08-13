import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import * as lark from '@larksuiteoapi/node-sdk'
import { environment } from '@metad/server-config'
import { LarkMessageCommand } from './commands'
import { client } from './client'


@Injectable()
export class LarkService {

    eventDispatcher = new lark.EventDispatcher({
        verificationToken: environment.larkConfig.verificationToken,
        encryptKey: environment.larkConfig.encryptKey,
        loggerLevel: lark.LoggerLevel.debug
    }).register({
        'im.message.receive_v1': async (data) => {
            const result = await this.commandBus.execute(new LarkMessageCommand(data as any))
            console.log(data, result)

            const chatId = data.message.chat_id
    
            const res = await client.im.message.create({
                params: {
                    receive_id_type: 'chat_id'
                },
                data: result
              
            })
            return res
        }
    })

    webhookEventDispatcher = lark.adaptExpress(this.eventDispatcher, {autoChallenge: true})

	constructor(private readonly commandBus: CommandBus) {
	}
}
