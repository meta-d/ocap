/**
 * Providers for LLMs
 * 
 * - https://js.langchain.com/docs/integrations/chat/
 */
export enum AiProvider {
  /**
   * - https://js.langchain.com/docs/integrations/chat/openai/
   */
  OpenAI = 'openai',
  /**
   * - https://js.langchain.com/docs/integrations/chat/openai/
   */
  Azure = 'azure',
  // DashScope = 'dashscope',
  /**
   * - https://ollama.com/
   * - https://js.langchain.com/docs/integrations/chat/ollama/
   */
  Ollama = 'ollama',
  /**
   * - https://www.deepseek.com/zh
   * - https://js.langchain.com/docs/integrations/chat/openai/
   */
  DeepSeek = 'deepseek',
  /**
   * - https://docs.anthropic.com/en/home
   * - https://js.langchain.com/docs/integrations/chat/anthropic/
   */
  Anthropic = 'anthropic',
  /**
   * - https://www.aliyun.com/product/bailian
   * - https://js.langchain.com/docs/integrations/chat/alibaba_tongyi/
   */
  AlibabaTongyi = 'alibaba_tongyi',
  /**
   * - https://open.bigmodel.cn/
   * - https://js.langchain.com/docs/integrations/chat/openai/
   */
  Zhipu = 'zhipu',
  /**
   * - https://qianfan.cloud.baidu.com/
   * - https://js.langchain.com/docs/integrations/chat/baidu_qianfan/
   */
  BaiduQianfan = 'baidu_qianfan',
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
  caption?: string
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
    caption: 'OpenAI',
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
    caption: 'Azure OpenAI',
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
  [AiProvider.AlibabaTongyi]: {
    caption: 'Alibaba Tongyi',
    protocol: AiProtocol.OpenAI,
    apiHost: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    isTools: true,
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
    caption: 'Ollama',
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
    caption: 'DeepSeek',
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
  },
  [AiProvider.Anthropic]: {
    caption: 'Anthropic',
    protocol: AiProtocol.Others,
    apiHost: 'https://api.anthropic.com/v1',
    isTools: true,
    models: [
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus'
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet'
      },
      {
        id: 'claude-2',
        name: 'Claude 2'
      },
    ]
  },
  [AiProvider.Zhipu]: {
    caption: 'Zhipu',
    protocol: AiProtocol.OpenAI,
    apiHost: 'https://open.bigmodel.cn/api/paas/v4',
    isTools: true,
    models: [
      {
        id: 'GLM-4-Plus',
        name: 'GLM-4-Plus'
      },
      {
        id: 'GLM-4-Long',
        name: 'GLM-4-Long'
      },
      {
        id: 'GLM-4-AirX',
        name: 'GLM-4-AirX'
      },
      {
        id: 'GLM-4-Air',
        name: 'GLM-4-Air'
      },
      {
        id: 'GLM-4-Flash',
        name: 'GLM-4-Flash'
      },
      {
        id: 'GLM-4-AllTools',
        name: 'GLM-4-AllTools'
      },
      {
        id: 'GLM-4V',
        name: 'GLM-4V'
      },
    ]
  },
  [AiProvider.BaiduQianfan]: {
    caption: 'Baidu Qianfan',
    protocol: AiProtocol.Others,
    models: [
      {
        id: 'ERNIE-4.0-8K',
        name: 'ERNIE 4.0 8K'
      },
    ]
  }
}
