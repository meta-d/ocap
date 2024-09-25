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
  /**
   * - https://www.together.ai/
   * - https://js.langchain.com/docs/integrations/chat/togetherai/
   */
  Together = 'together',
  /**
   * - https://platform.moonshot.cn/console
   * - https://js.langchain.com/docs/integrations/chat/openai/
   */
  Moonshot = 'moonshot',
  /**
   * - https://groq.com/
   * - https://js.langchain.com/docs/integrations/chat/openai/
   */
  Groq = 'groq',
  /**
   * - https://mistral.ai/
   * 
   */
  Mistral = 'mistral',
  /**
   * - https://cohere.com/
   */
  Cohere = 'cohere',
  
}

export enum AiProtocol {
  OpenAI = 'openai',
  Others = 'others'
}

export type AiModelType = {
  id: string
  name: string
  embed?: boolean
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
  homepage?: string
}

export const AI_PROVIDERS: Record<AiProvider, Partial<AiProviderType>> = {
  [AiProvider.OpenAI]: {
    caption: 'OpenAI',
    protocol: AiProtocol.OpenAI,
    apiHost: 'https://api.openai.com/v1',
    homepage: 'https://platform.openai.com/',
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
      },
      {
        id: 'text-embedding-3-small',
        name: 'Text Embedding 3 small',
        embed: true
      },
      {
        id: 'text-embedding-3-large',
        name: 'Text Embedding 3 large',
        embed: true
      },
      {
        id: 'text-embedding-ada-002',
        name: 'Text Embedding ada 002',
        embed: true
      }
    ]
  },
  [AiProvider.Azure]: {
    caption: 'Azure OpenAI',
    protocol: AiProtocol.OpenAI,
    apiHost: '',
    homepage: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service/',
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
    homepage: 'https://bailian.console.aliyun.com/',
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
    homepage: 'https://ollama.com/',
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
        id: 'qwen2.5',
        name: 'Qwen 2.5 7b'
      },
      {
        id: 'qwen2.5:14b',
        name: 'Qwen 2.5 14b'
      },
      {
        id: 'qwen2.5:32b',
        name: 'Qwen 2.5 32b'
      },
      {
        id: 'qwen2.5:72b',
        name: 'Qwen 2.5 72b'
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
    homepage: 'https://platform.deepseek.com/',
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
    homepage: 'https://www.anthropic.com/',
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
    homepage: 'https://open.bigmodel.cn/',
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
    homepage: 'https://qianfan.cloud.baidu.com/',
    models: [
      {
        id: 'ERNIE-4.0-8K',
        name: 'ERNIE 4.0 8K'
      },
    ]
  },
  [AiProvider.Together]: {
    caption: 'Together',
    protocol: AiProtocol.OpenAI,
    apiHost: 'https://api.together.xyz/v1',
    homepage: 'https://www.together.ai/',
    isTools: true,
    models: [
      {
        id: 'meta-llama/Llama-3-70b-chat-hf',
        name: 'LLaMA-3 Chat (70B)'
      },
      {
        id: 'Qwen/Qwen2-72B-Instruct',
        name: 'Qwen 2 Instruct (72B)'
      },
      {
        id: 'google/gemma-7b-it',
        name: 'Gemma Instruct (7B)'
      },
      {
        id: 'deepseek-ai/deepseek-llm-67b-chat',
        name: 'DeepSeek LLM Chat (67B)'
      },
    ]
  },
  [AiProvider.Moonshot]: {
    caption: 'Moonshot',
    protocol: AiProtocol.OpenAI,
    apiHost: 'https://api.moonshot.cn/v1',
    modelsUrl: '/models',
    homepage: 'https://platform.moonshot.cn/',
    isTools: true,
    models: [
      {
        id: 'moonshot-v1-8k',
        name: 'v1 8k'
      },
      {
        id: 'moonshot-v1-32k',
        name: 'v1 32k'
      },
      {
        id: 'moonshot-v1-128k',
        name: 'v1 128k'
      },
    ]
  },
  [AiProvider.Groq]: {
    caption: 'Groq',
    protocol: AiProtocol.OpenAI,
    apiHost: 'https://api.groq.com/openai/v1',
    modelsUrl: '/models',
    homepage: 'https://groq.com/',
    isTools: true,
    models: [
      {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7b 32768'
      },
    ]
  },
  [AiProvider.Mistral]: {
    caption: 'Mistral',
    protocol: AiProtocol.OpenAI,
    apiHost: 'https://api.mistral.ai/v1',
    modelsUrl: '/models',
    homepage: 'https://mistral.ai/',
    isTools: true,
    models: [
      {
        id: 'mistral-large-latest',
        name: 'Mistral Large 128k'
      },
      {
        id: 'mistral-small-latest',
        name: 'Mistral Small 32k'
      },
      {
        id: 'codestral-latest',
        name: 'Codestral 32k'
      },
      {
        id: 'mistral-embed',
        name: 'Mistral Embed 8k',
        embed: true
      }
    ]
  },
  [AiProvider.Cohere]: {
    caption: 'Cohere',
    protocol: AiProtocol.Others,
    apiHost: 'https://api.cohere.com/v1',
    modelsUrl: '/models',
    homepage: 'https://cohere.com/',
    isTools: true,
    models: [
      {
        id: 'command-r-plus',
        name: 'Command R Plus 128k'
      },
      {
        id: 'command-r',
        name: 'Command R 128k'
      },
      {
        id: 'command',
        name: 'Command 4k'
      },
      {
        id: 'embed-english-v3.0',
        name: 'Embed English 1024D 512k',
        embed: true
      },
      {
        id: 'embed-english-light-v3.0',
        name: 'Embed English light 384D 512k',
        embed: true
      },
      {
        id: 'embed-multilingual-v3.0',
        name: 'Embed 1024D 512k',
        embed: true
      },
      {
        id: 'embed-multilingual-light-v3.0',
        name: 'Embed light 384D 512k',
        embed: true
      }
    ]
  }
}
