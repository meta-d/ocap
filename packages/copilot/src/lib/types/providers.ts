export enum AiProvider {
  OpenAI = 'openai',
  Azure = 'azure',
  DashScope = 'dashscope'
}

export type AiModelType = {
  id: string
  name: string
}

export const AI_PROVIDERS = {
  [AiProvider.OpenAI]: {
    apiHost: 'https://api.openai.com',
    chatCompletionsUrl: '/v1/chat/completions',
    modelsUrl: '/v1/models',
    models: [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo'
      },
      {
        id: 'gpt-4',
        name: 'GPT-4'
      },
      {
        id: 'gpt-4-32k',
        name: 'GPT-4 32K'
      }
    ] as AiModelType[]
  },
  [AiProvider.Azure]: {
    apiHost: '',
    chatCompletionsUrl: '/v1/chat/completions',
    modelsUrl: '/v1/models',
    models: [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo'
      },
      {
        id: 'gpt-4',
        name: 'GPT-4'
      },
      {
        id: 'gpt-4-32k',
        name: 'GPT-4 32K'
      }
    ] as AiModelType[]
  },
  [AiProvider.DashScope]: {
    apiHost: 'https://dashscope.aliyuncs.com',
    chatCompletionsUrl: '/api/v1/services/aigc/text-generation/generation',
    modelsUrl: null,
    models: [
      {
        id: 'qwen-turbo',
        name: '通义千问 Turbo'
      },
      {
        id: 'qwen-plus',
        name: '通义千问 Plus'
      }
    ] as AiModelType[]
  }
}
