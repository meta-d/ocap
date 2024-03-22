import { Injectable } from '@angular/core'
import { UseChatOptions } from '@metad/copilot'
import { ChatRequest, ChatRequestOptions, JSONValue, Message, nanoid } from 'ai'
import { NgmClientCopilotService } from '../services'

@Injectable()
export class NgmSBCopilotService extends NgmClientCopilotService {
  override async chat(
    {
      sendExtraMessageFields,
      onResponse,
      onFinish,
      onError,
      credentials,
      headers,
      body,
      generateId = nanoid
    }: UseChatOptions = {
      model: null
    },
    chatRequest: ChatRequest,
    { options, data }: ChatRequestOptions = {},
  ): Promise<
    | Message
    | {
        messages: Message[]
        data: JSONValue[]
      }
  > {
    console.log(`Calling chat in NgmSBCopilotService class`, body, chatRequest)

    return {
      id: generateId(),
      content: 'Calling chat in NgmSBCopilotService class',
      role: 'assistant'
    }
  }
}
