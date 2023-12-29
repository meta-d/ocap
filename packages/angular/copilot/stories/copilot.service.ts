import { Injectable } from '@angular/core'
import { ChatRequest, ChatRequestOptions, JSONValue, Message, UseChatOptions, nanoid } from 'ai'
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
    }: UseChatOptions = {},
    chatRequest: ChatRequest,
    { options, data }: ChatRequestOptions = {},
    {
      abortController
    }: {
      abortController: AbortController | null
    }
  ): Promise<
    | Message
    | {
        messages: Message[]
        data: JSONValue[]
      }
  > {
    console.log(`Calling chat in NgmSBCopilotService class`, body)

    return {
      id: generateId(),
      content: 'Calling chat in NgmSBCopilotService class',
      role: 'assistant'
    }
  }
}
