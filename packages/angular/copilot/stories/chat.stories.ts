/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommonModule } from '@angular/common'
import { provideHttpClient } from '@angular/common/http'
import { ChangeDetectionStrategy, Component, Injectable, importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import {
  AIOptions,
  AnnotatedFunction,
  CopilotChatMessage,
  CopilotChatMessageRoleEnum,
  CopilotChatOptions,
  CopilotChatResponseChoice,
  CopilotCommand,
  CopilotEngine,
  CopilotService
} from '@metad/copilot'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { Meta, StoryObj, applicationConfig, argsToTemplate, moduleMetadata } from '@storybook/angular'
import { nanoid } from 'nanoid'
import { provideMarkdown } from 'ngx-markdown'
import { Observable, of } from 'rxjs'
import { provideLogger, provideTranslate, zhHansLanguage } from '../../mock/'
import { NgmCopilotChatComponent } from '../chat/chat.component'
import { injectCopilotCommand } from '../hooks/'
import { NgmClientCopilotService, NgmCopilotEngineService } from '../services'
import { NgmSBCopilotService } from './copilot.service'

@Injectable()
class StorybookCopilotEngine extends NgmCopilotEngineService {}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-sb-copilot-user',
  template: `<h1>Create a user</h1>`,
  styles: [''],
  imports: [CommonModule]
})
export class NgmSBCopilotUserComponent {
  #myCommand = injectCopilotCommand({
    name: 'c',
    description: 'Create a user',
    examples: [`Create a user name Tiven, age 18`],
    systemPrompt: () => {
      return `Create a user by prompt`
    },
    implementation: async (args) => {
      console.log(`Created user`)
      return {
        id: nanoid(),
        content: '创建执行成功',
        role: CopilotChatMessageRoleEnum.Info
      }
    }
  })

  #saveCommand = injectCopilotCommand({
    name: 's',
    description: 'Save the user',
    examples: [`Save a user name Tiven, age 18`],
    systemPrompt: () => {
      return `Save a user by prompt`
    },
  })

  #noExampleCommand = injectCopilotCommand({
    name: 'n',
    description: 'New a user',
    systemPrompt: () => {
      return `New a user by prompt`
    },
  })
}

export default {
  title: 'Copilot/Chat',
  component: NgmCopilotChatComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        provideHttpClient(),
        provideTranslate(zhHansLanguage),
        importProvidersFrom(OcapCoreModule),
        provideLogger(),
        provideMarkdown()
      ]
    }),
    moduleMetadata({
      imports: [CommonModule, NgmCopilotChatComponent, NgmSBCopilotUserComponent],
      providers: [
        {
          provide: CopilotService,
          useClass: NgmSBCopilotService
        },
        {
          provide: NgmCopilotEngineService,
          useClass: StorybookCopilotEngine
        },
        {
          provide: NgmClientCopilotService.CopilotConfigFactoryToken,
          useFactory: () => () => {
            return Promise.resolve({
              enabled: true,
              apiKey: 'st-xxxxxx'
            })
          }
        }
      ]
    })
  ]
} as Meta<NgmCopilotChatComponent>

type Story = StoryObj<NgmCopilotChatComponent>

export const Primary: Story = {
  args: {
    welcomeTitle: 'Welcome to My AI Copilot'
  }
}

export const Size: Story = {
  render: (args) => ({
    props: args,
    template: `<ngm-copilot-chat ${argsToTemplate(
      args
    )} class="h-[500px] w-[300px] shadow-lg rounded-lg m-4" style="height: 500px;"></ngm-copilot-chat>`
  }),
  args: {
    welcomeTitle: 'Welcome to My AI Copilot'
  },
  parameters: {
    background: { default: 'dark' },
    actions: { argTypesRegex: '^conversations.*' }
  }
}

export const CustomNgmCopilotEngine: Story = {
  render: (args) => ({
    props: args,
    template: `
<div>
  <ngm-sb-copilot-user></ngm-sb-copilot-user>
  <ngm-copilot-chat ${argsToTemplate(
    args
  )} class="h-[500px] w-[300px] shadow-lg rounded-lg m-4" style="height: 500px;"></ngm-copilot-chat>
</div>`
  }),
  args: {
    welcomeTitle: 'Welcome to My AI Copilot'
  }
}

class StorybookCustomCopilotEngine implements CopilotEngine {
  chat(prompt: string, options?: CopilotChatOptions): Promise<string | void | CopilotChatMessage> {
    throw new Error('Method not implemented.')
  }
  updateConversations?(fn: (conversations: CopilotChatMessage[][]) => CopilotChatMessage[][]): void {
    throw new Error('Method not implemented.')
  }
  updateLastConversation?(fn: (conversations: CopilotChatMessage[]) => CopilotChatMessage[]): void {
    throw new Error('Method not implemented.')
  }
  messages(): CopilotChatMessage[] {
    throw new Error('Method not implemented.')
  }
  copilot?: CopilotService
  dropCopilot?: (event: any) => void
  setEntryPoint?: (id: string, entryPoint: AnnotatedFunction<any[]>) => void
  removeEntryPoint?: (id: string) => void
  registerCommand?(area: string, command: CopilotCommand<any[]>): void {
    throw new Error('Method not implemented.')
  }
  unregisterCommand?(area: string, name: string): void {
    throw new Error('Method not implemented.')
  }
  commands?: () => CopilotCommand<any[]>[]
  deleteMessage(message: CopilotChatMessage): void {
    throw new Error('Method not implemented.')
  }
  name?: string = 'Storybook custom engine'
  aiOptions: AIOptions = {
    model: '',
    messages: []
  }
  systemPrompt?: string
  prompts: string[] = ['/d {name} {age}']
  // conversations: Array<CopilotChatMessage[]> = []
  placeholder?: string

  conversations(): Array<CopilotChatMessage[]> {
    return []
  }

  upsertMessage(message: CopilotChatMessage): void {}
  clear() {
  }
}

export const CustomEngine: Story = {
  args: {
    copilotEngine: new StorybookCustomCopilotEngine()
  }
}
