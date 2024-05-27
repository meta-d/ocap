import { Signal, inject } from '@angular/core'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { CopilotAgentType, CopilotEngine } from '@metad/copilot'
import { TranslateService } from '@ngx-translate/core'
import { injectCopilotCommand } from './inject-copilot-command'
import { NgmCopilotService } from '../services'

export function injectCommonCommands(copilotEngine: Signal<CopilotEngine>) {
  const translate = inject(TranslateService)
  const copilotService = inject(NgmCopilotService)
  
  return [
    injectCopilotCommand({
      name: 'clear',
      description: translate.instant('Ngm.Copilot.ClearConversation', { Default: 'Clear conversation' }),
      implementation: async () => {
        copilotEngine().clear()
      }
    }),

    injectCopilotCommand('help', {
      alias: '?',
      description: translate.instant('Ngm.Copilot.Help', { Default: 'Help' }),
      agent: {
        type: CopilotAgentType.LangChain,
        conversation: true
      },
      implementation: async () => {
        return `You can ask me general programming questions, or chat with the following participants which have specialized expertise and can perform actions:
- [@workspace](#calc) - Ask about your workspace
  - /explain - Explain how the code in your active editor works
  - /tests - Generate unit tests for the selected code
  - /fix - Propose a fix for the problems in the selected code
        /new - Scaffold code for a new workspace
        /newNotebook - Create a new Jupyter Notebook
- @vscode - Ask questions about VS Code
        /search - Generate query parameters for workspace search
        /api - Ask about VS Code extension development
- @terminal - Ask how to do something in the terminal
        /explain - Explain something in the terminal`
      },
      prompt: ChatPromptTemplate.fromMessages([
        [
          'system',
          `你是一个有用的数据分析 Agent, ` + (copilotService.roleDetail() ? `你的角色是: ${copilotService.roleDetail().title} 你的职责是：${copilotService.roleDetail().description};` : '') +
`请自我介绍并告诉用户你能他们做什么`
        ],
        new MessagesPlaceholder({
          variableName: 'chat_history',
        }),
        ['human', '{input}'],
      ])
    })
  ]
}
