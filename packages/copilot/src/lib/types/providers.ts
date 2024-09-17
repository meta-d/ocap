/**
 * Providers for LLMs
 * 
 * - https://js.langchain.com/v0.2/docs/integrations/chat/
 */
export enum AiProvider {
  /**
   * - https://js.langchain.com/v0.2/docs/integrations/chat/openai
   */
  OpenAI = 'openai',
  /**
   * - https://js.langchain.com/v0.2/docs/integrations/chat/azure
   */
  Azure = 'azure',
  DashScope = 'dashscope',
  /**
   * - https://ollama.com/
   * - https://js.langchain.com/v0.2/docs/integrations/chat/ollama
   */
  Ollama = 'ollama',
  DeepSeek = 'deepseek'
}

export enum AiProtocol {
  OpenAI = 'openai',
  Others = 'others'
}

export type AiModelType = {
  id: string
  name: string
}

export type AiProviderType = {
  protocol: AiProtocol
  apiHost: string
  chatCompletionsUrl: string
  modelsUrl: string | null
  models: AiModelType[]
  /**
   * If the provider has tools function
   */
  isTools: boolean
}

export const AI_PROVIDERS: Record<AiProvider, Partial<AiProviderType>> = {
  [AiProvider.OpenAI]: {
    protocol: AiProtocol.OpenAI,
    apiHost: 'https://api.openai.com/v1',
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
        id: 'gpt-4o',
        name: 'GPT-4 Omni'
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4 O mini'
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo'
      },
      {
        id: 'gpt-4',
        name: 'GPT-4'
      },
      {
        id: 'gpt-4-32k',
        name: 'GPT-4 32k'
      },
      {
        id: 'o1-preview',
        name: 'o1 Preview'
      },
      {
        id: 'o1-mini',
        name: 'o1 Mini'
      }
    ]
  },
  [AiProvider.Azure]: {
    protocol: AiProtocol.OpenAI,
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
        id: 'gpt-4o',
        name: 'GPT-4 Omni'
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo'
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
    apiHost: 'https://dashscope.aliyuncs.com/api/v1',
    chatCompletionsUrl: '/services/aigc/text-generation/generation',
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
  },
  [AiProvider.Ollama]: {
    isTools: true,
    models: [
      {
        id: 'llama3',
        name: 'LLama 3'
      },
      {
        id: 'llama3.1:8b',
        name: 'LLama 3.1 8b'
      },
      {
        id: 'llama3.1:70b',
        name: 'LLama 3.1 70b'
      },
      {
        id: 'llama3.1:405b',
        name: 'LLama 3.1 405b'
      },
      {
        id: 'qwen2',
        name: 'Qwen 2'
      },
      {
        id: 'gemma2',
        name: 'Gemma 2'
      },
      {
        id: 'phi3',
        name: 'Phi-3'
      },
      {
        id: 'llama3-groq-tool-use',
        name: 'Llama3 Groq Tool Use'
      },
    ]
  },
  [AiProvider.DeepSeek]: {
    protocol: AiProtocol.OpenAI,
    apiHost: 'https://api.deepseek.com/v1',
    chatCompletionsUrl: '/chat/completions',
    modelsUrl: '/models',
    isTools: true,
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat'
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder'
      },
    ]
  }
}
