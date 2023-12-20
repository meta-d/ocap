/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommonModule } from '@angular/common'
import { provideHttpClient } from '@angular/common/http'
import { importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { AIOptions, CopilotChatMessage, CopilotChatResponseChoice, CopilotEngine } from '@metad/copilot'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { Meta, StoryObj, applicationConfig, argsToTemplate, moduleMetadata } from '@storybook/angular'
import { MarkdownModule } from 'ngx-markdown'
import { Observable, of } from 'rxjs'
import { provideTranslate, zhHansLanguage } from '../../mock/'
import { NgmCopilotChatComponent } from '../chat/chat.component'
import { NgmCopilotService } from '../services'

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
        importProvidersFrom(MarkdownModule.forRoot())
      ]
    }),
    moduleMetadata({
      imports: [CommonModule, NgmCopilotChatComponent],
      providers: [
        NgmCopilotService,
        {
          provide: NgmCopilotService.CopilotConfigFactoryToken,
          useValue: () =>
            Promise.resolve({
              enabled: true,
              apiKey: 'sk-xxxxxxxxxxxxxxx'
            })
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

class StorybookCopilotEngine implements CopilotEngine {
  name?: string = 'Storybook custom engine'
  aiOptions: AIOptions = {
    model: '',
    messages: []
  }
  systemPrompt?: string
  prompts: string[] = ['/d {name} {age}']
  conversations: CopilotChatMessage[] = []
  placeholder?: string

  process(
    data: { prompt: string; messages?: CopilotChatMessage[] },
    options?: { action?: string }
  ): Observable<string | CopilotChatMessage[]> {
    if (data.prompt === '/d {name} {age}') {
      const name = options?.action || 'John'
      const age = options?.action || '18'
      return of(`My name is ${name}, I am ${age} years old.`)
    }

    return of('Non')
  }
  preprocess?(prompt: string, options?: any) {
    //
  }
  postprocess?(prompt: string, choices: CopilotChatResponseChoice[]): Observable<string | CopilotChatMessage[]> {
    throw new Error('Method not implemented.')
  }
  dropCopilot?(event: never) {
    throw new Error('Method not implemented.')
  }
}

export const CustomEngine: Story = {
  args: {
    copilotEngine: new StorybookCopilotEngine()
  }
}
