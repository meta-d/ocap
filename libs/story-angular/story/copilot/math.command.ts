import { inject } from '@angular/core'
import { zodToProperties } from '@metad/core'
import { injectCopilotCommand, injectMakeCopilotActionable } from '@metad/ocap-angular/copilot'
import { NxStoryService } from '@metad/story/core'
import { NGXLogger } from 'ngx-logger'
import { ChartWidgetSchema } from './schema'
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";


/**
 */
export function injectMathCommand(storyService: NxStoryService) {
  const logger = inject(NGXLogger)

  const widget = storyService.currentWidget()
  const page = storyService.currentStoryPoint()

  logger.debug(`Original chart widget is`, widget, page)

  const addTool = new DynamicStructuredTool({
    name: "add",
    description: "Add two integers together.",
    schema: z.object({
      firstInt: z.number(),
      secondInt: z.number(),
    }),
    func: async ({ firstInt, secondInt }) => {
      return (firstInt + secondInt).toString();
    },
  });
  
  const multiplyTool = new DynamicStructuredTool({
    name: "multiply",
    description: "Multiply two integers together.",
    schema: z.object({
      firstInt: z.number(),
      secondInt: z.number(),
    }),
    func: async ({ firstInt, secondInt }) => {
      return (firstInt * secondInt).toString();
    },
  });
  
  const exponentiateTool = new DynamicStructuredTool({
    name: "exponentiate",
    description: "Exponentiate the base to the exponent power.",
    schema: z.object({
      base: z.number(),
      exponent: z.number(),
    }),
    func: async ({ base, exponent }) => {
      return (base ** exponent).toString();
    },
  });

  const tools = [addTool, multiplyTool, exponentiateTool];

  return injectCopilotCommand({
    name: 'math',
    description: 'Describe what you want to calculate',
    actions: [
      injectMakeCopilotActionable({
        name: 'modify_widget',
        description: 'Modify widget component settings',
        argumentAnnotations: [
          {
            name: 'widget',
            type: 'object',
            description: 'Widget settings',
            properties: zodToProperties(ChartWidgetSchema),
            required: true
          }
        ],
        implementation: async (widget) => {
          logger.debug(`Function calling 'modify_widget', params is:`, widget)

          return `✅`
        }
      })
    ],
    tools,
    prompt: ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant"],
        new MessagesPlaceholder({
          variableName:"chat_history",
          optional: true
          }),
        ["user", "{input}"],
        new MessagesPlaceholder("agent_scratchpad"),
      ])
  })
}
