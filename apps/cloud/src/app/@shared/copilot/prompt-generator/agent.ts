import { inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { NgmCopilotService } from '@metad/copilot-angular'
import { nonNullable } from '@metad/ocap-core'
import { filter, switchMap } from 'rxjs/operators'


export function injectPromptGenerator() {
  const copilotService = inject(NgmCopilotService)
  const role = copilotService.rolePrompt
  const language = copilotService.languagePrompt

  return toSignal(copilotService.forkChatModel$({maxRetries: 0}).pipe(
      filter(nonNullable),
      switchMap(async (chatModel) => {
        const prompt = ChatPromptTemplate.fromMessages(
          [
            [
              'human',
              `Here is a task description for which I would like you to create a high-quality prompt template for:
<task_description>
{{TASK_DESCRIPTION}}
</task_description>
Based on task description, please create a well-structured prompt template that another AI could use to consistently complete the task. The prompt template should include:
- Descriptive variable names surrounded by (two curly brackets) to indicate where the actual values will be substituted in. Choose variable names that clearly indicate the type of value expected. Variable names have to be composed of number, english alphabets and underline and nothing else. 
- Clear instructions for the AI that will be using this prompt, demarcated with <instructions> tags. The instructions should provide step-by-step directions on how to complete the task using the input variables. Also Specifies in the instructions that the output should not contain any xml tag. 
- Relevant examples if needed to clarify the task further, demarcated with <example> tags. Do not use curly brackets any other than in <instruction> section. 
- Any other relevant sections demarcated with appropriate XML tags like <input>, <output>, etc.
- Use the same language as task description. 
Please generate the full prompt template and output only the prompt template.
`
            ]
          ],
          { templateFormat: 'mustache' }
        )

        return prompt.pipe(chatModel)
      })
    )
  )
}


export const Prompts = [
  {
    content: ``,
    icon: ''
  }
]