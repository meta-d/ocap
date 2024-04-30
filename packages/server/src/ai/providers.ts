/**
 * Keep consistent with {@link packages/copilot/src/providers.ts}
 */
export enum AiProvider {
  OpenAI = 'openai',
  Azure = 'azure',
  DashScope = 'dashscope'
}

export type AiModelType = {
  id: string
  name: string
}

export type AiProviderType = {
  apiHost: string
  chatCompletionsUrl: string
  modelsUrl: string | null
  models: AiModelType[]
  /**
   * If the provider has tools function
   */
  isTools: boolean
}

export const AI_PROVIDERS: Record<AiProvider, AiProviderType> = {
  [AiProvider.OpenAI]: {
    apiHost: 'https://api.openai.com',
    chatCompletionsUrl: '/chat/completions',
    modelsUrl: '/models',
    isTools: true,
    models: [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo'
      },
      {
        id: 'gpt-3.5-turbo-16k',
        name: 'GPT-3.5 Turbo 16k'
      },
      {
        id: 'gpt-4',
        name: 'GPT-4'
      },
      {
        id: 'gpt-4-32k',
        name: 'GPT-4 32k'
      }
    ]
  },
  [AiProvider.Azure]: {
    apiHost: '',
    chatCompletionsUrl: '/chat/completions',
    modelsUrl: '/models',
    isTools: true,
    models: [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo'
      },
      {
        id: 'gpt-3.5-turbo-16k',
        name: 'GPT-3.5 Turbo 16k'
      },
      {
        id: 'gpt-4',
        name: 'GPT-4'
      },
      {
        id: 'gpt-4-32k',
        name: 'GPT-4 32k'
      }
    ]
  },
  [AiProvider.DashScope]: {
    apiHost: 'https://dashscope.aliyuncs.com',
    chatCompletionsUrl: '/api/v1/services/aigc/text-generation/generation',
    modelsUrl: null,
    isTools: false,
    models: [
      {
        id: 'qwen-turbo',
        name: '通义千问 Turbo'
      },
      {
        id: 'qwen-plus',
        name: '通义千问 Plus'
      },
      {
        id: 'qwen-max',
        name: '通义千问 Max'
      },
      {
        id: 'qwen-1.8b-chat',
        name: '通义千问 1.8b'
      },
      {
        id: 'qwen-7b-chat',
        name: '通义千问 7b'
      },
      {
        id: 'qwen-14b-chat',
        name: '通义千问 14b'
      },
      {
        id: 'qwen-72b-chat',
        name: '通义千问 72b'
      },
      {
        id: 'llama2-7b-chat-v2',
        name: 'LLaMa2 7b v2'
      },
      {
        id: 'llama2-13b-chat-v2',
        name: 'LLaMa2 13b v2'
      },
      {
        id: 'chatglm-6b-v2',
        name: 'ChatGLM 6b v2'
      },
      {
        id: 'chatglm3-6b',
        name: 'ChatGLM3 6b'
      },
      {
        id: 'baichuan-7b-v1',
        name: '百川 7b v1'
      },
      {
        id: 'baichuan2-7b-chat-v1',
        name: '百川2 7b v1'
      }
    ]
  }
}
