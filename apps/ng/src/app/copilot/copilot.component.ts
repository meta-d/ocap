import { CommonModule } from '@angular/common'
import { Component, OnInit, signal } from '@angular/core'
import { CopilotChatMessageRoleEnum, CopilotService, getFunctionCall } from '@metad/copilot'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { NgmCopilotChatComponent, injectCopilotCommand, injectMakeCopilotActionable } from '@metad/ocap-angular/copilot'


@Component({
  standalone: true,
  selector: 'ngm-ocap-copilot',
  templateUrl: './copilot.component.html',
  styleUrls: ['./copilot.component.scss'],
  imports: [CommonModule, NgmCopilotChatComponent]
})
export class CopilotComponent implements OnInit {

  foods = signal<string[]>([])

  #listAllFoodCommand = injectCopilotCommand({
    name: 'food',
    description: 'List all food items mentioned in the text.',
    examples: [
      'List all food items mentioned in the text.'
    ],
    actions: [
      injectMakeCopilotActionable({
        name: 'list-all-food',
        description: 'List all food items',
        argumentAnnotations: [
          {
            name: 'foods',
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'The foods list',
            required: true
          }
        ],
        implementation: async (foods: string[]) => {
          this.foods.set(foods)
        }
      })
    ]
  })
  
  // zodSchema = z.object({
  //   foods: z
  //     .array(
  //       z.object({
  //         name: z.string().describe('The name of the food item'),
  //         healthy: z.boolean().describe('Whether the food is good for you'),
  //         color: z.string().optional().describe('The color of the food')
  //       })
  //     )
  //     .describe('An array of food items mentioned in the text')
  // })

  ngOnInit(): void {
    // this.copilot
    //   .chatCompletions(
    //     [
    //       {
    //         id: nanoid(),
    //         role: CopilotChatMessageRoleEnum.System,
    //         content: 'List all food items mentioned in the following text.'
    //       },
    //       {
    //         id: nanoid(),
    //         role: CopilotChatMessageRoleEnum.User,
    //         content: 'I like apples, bananas, oxygen, and french fries.'
    //       }
    //     ],
    //     {
    //       model: 'gpt-3.5-turbo-0613',
    //       temperature: 0,
    //       top_p: 1,
    //       frequency_penalty: 0,
    //       presence_penalty: 0,
    //       n: 1,
    //       stream: false,
    //       functions: [
    //         {
    //           name: 'output_formatter',
    //           description: 'Should always be used to properly format output',
    //           parameters: zodToJsonSchema(this.zodSchema)
    //         }
    //       ],
    //       function_call: { name: 'output_formatter' }
    //     }
    //   )
    //   .subscribe((response) => {
    //     this.output.set(getFunctionCall(response.choices[0].message))
    //     console.log(this.output())
    //   })
  }
}
